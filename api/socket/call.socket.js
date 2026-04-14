import Call from "../models/Call.js";


const registerCallEvents = (io, socket, socketIdForEmployee) => {

socket.on("call:invite", async ({ participants = [], callType, conversationId = null, calleeName, calleeImg, }, ack) => {
  try {
    const callerId = socket.employeeId;
    if (!callerId) return ack?.({ ok: false, reason: "not_authenticated" });

    // Remove caller from participants to avoid sending incoming to self
    const callees = participants.filter(id => id !== callerId);
    if (!callees.length) return ack?.({ ok: false, reason: "no_valid_callees" });

    // Create call record
    const callDoc = await Call.create({
      companyId: socket.companyId,
      callType,
      participants: [
        { employeeId: callerId, role: "caller", joinedAt: new Date() },
        ...callees.map(id => ({ employeeId: id, role: "callee" }))
      ],
      callStatus: "ringing",
      startedAt: new Date()
    });
    const callId = callDoc._id.toString();

    const notified = [];
    for (const callee of callees) {
      const calleeSocketId = socketIdForEmployee(callee);
      if (calleeSocketId) {
        io.to(calleeSocketId).emit("call:incoming", {
          callId,
          from: callerId,
          to: calleeSocketId,
          fromName: calleeName,
          calleeImg: calleeImg,
          callType,
          participants: [callerId, ...callees],
          conversationId
        });
        notified.push(callee);
      }
    }

    if (!notified.length) {
      await Call.findByIdAndUpdate(callId, { callStatus: "missed", endedAt: new Date() });
      return ack?.({ ok: false, reason: "callee_offline" });
    }

    return ack?.({ ok: true, callId, notified });
  } catch (err) {
    console.error("call:invite error:", err);
    return ack?.({ ok: false, reason: "server_error" });
  }
});

// Forward SDP offer (from caller -> callee)
socket.on("call:offer", ({ callId, remoteId, offer }, ack) => {
  try {
    const callerId = socket.employeeId;
    const targetSocketId = socketIdForEmployee(remoteId);
    if (!targetSocketId) {
      if (ack) ack({ ok: false, reason: "target_offline" });
      return;
    }
    // include 'from' so callee can know who sent the offer
    io.to(targetSocketId).emit("call:offer", { callId, remoteId:callerId, offer });
    if (ack) ack({ ok: true });
  } catch (err) {
    console.error("call:offer error:", err);
    if (ack) ack({ ok: false });
  }
});

socket.on("call:answer", async ({ callId, remoteId, answer }, ack) => {
  try {
    const userId = socket.employeeId;
    const call = await Call.findById(callId);
    if (!call) {
      return ack?.({ ok: false, reason: "call_not_found" });
    }

    // 🔹 update once (safe for group calls)
    if (call.callStatus === "ringing") {
      call.callStatus = "ongoing";
      await call.save().catch(() => {});
    }

    const targetSocketId = socketIdForEmployee(remoteId);
    if (!targetSocketId) {
      return ack?.({ ok: false, reason: "target_offline" });
    }

    io.to(targetSocketId).emit("call:answer", {
      callId,
      remoteId:userId,
      answer
    });
    return ack?.({ ok: true });
  } catch (err) {
    console.error("call:answer error:", err);
    return ack?.({ ok: false, reason: "server_error" });
  }
});

socket.on("call:ice", async ({ callId, remoteId, candidate }, ack) => {
  try {
    const employeeId = socket.employeeId;
    if (!employeeId) {
      return ack?.({ ok: false, reason: "not_authenticated" });
    }

    const call = await Call.findById(callId);
    if (!call) {
      return ack?.({ ok: false, reason: "call_not_found" });
    }

    const isParticipant = call.participants.some(
      p => p.employeeId.toString() === employeeId
    );
    if (!isParticipant) {
      return ack?.({ ok: false, reason: "not_a_participant" });
    }

    const targetSocketId = socketIdForEmployee(remoteId);
    if (!targetSocketId) {
      return ack?.({ ok: false, reason: "target_offline" });
    }
    io.to(targetSocketId).emit("call:ice", {
      callId,
      remoteId: employeeId,
      candidate
    });

    return ack?.({ ok: true });
  } catch (err) {
    console.error("call:ice error:", err);
    return ack?.({ ok: false, reason: "server_error" });
  }
});

socket.on("client:log", (payload) => {
  console.log("📱 MOBILE LOG:", payload);
});

socket.on("call:end", async ({ callId, reason = "hangup" }, ack) => {
  try {
    const employeeId = socket.employeeId;
    if (!employeeId) {
      return ack?.({ ok: false, reason: "not_authenticated" });
    }

    if (!callId) {
      return ack?.({ ok: false, reason: "missing_call_id" });
    }

    // 🔹 Load call from DB
    const call = await Call.findById(callId);
    if (!call) {
      return ack?.({ ok: false, reason: "call_not_found" });
    }

    // 🔹 Prevent double-ending
    if (call.callStatus === "ended") {
      return ack?.({ ok: true, alreadyEnded: true });
    }

    // 🔹 Mark call ended (single source of truth)
    call.callStatus = "ended";
    call.endedAt = new Date();
    call.endReason = reason;
    await call.save();

    // 🔹 Notify ALL participants except sender
    for (const p of call.participants) {
      const targetEmployeeId = p.employeeId.toString();
      if (targetEmployeeId === employeeId) continue;

      const targetSocketId = socketIdForEmployee(targetEmployeeId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call:end", {
          callId,
          reason,
          endedBy: employeeId
        });
      }
    }

    return ack?.({ ok: true });
  } catch (err) {
    console.error("call:end error:", err);
    return ack?.({ ok: false, reason: "server_error" });
  }
});

}

export default registerCallEvents;