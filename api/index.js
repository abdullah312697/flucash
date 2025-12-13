// =========================
// ✅ Import Dependencies
// =========================
import express, { json } from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { set, connect } from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import webpush from "web-push";
import { config } from "dotenv";

// =========================
// ✅ Load Environment Variables
// =========================
config();

// =========================
// ✅ Import Route Modules
// =========================
import productData from "./routes/deshbord.js";
import userRouter from "./routes/UserProcess.js";
import sliderAction from "./routes/SliderAction.js";
import CustomerReview from "./routes/CustomerReview.js";
import ContactTo from "./routes/ContactTo.js";
import AddOrder from "./routes/AddOrder.js";
import Facebook from "./routes/Facebook.js";
import Banner from "./routes/Banner.js";
import Setmytarget from "./routes/Setmytarget.js";
import AddEmplyee from "./routes/AddEmplyee.js";
import ClientAddProduct from "./routes/ClientAddProduct.js";
import conversationRoutes from "./routes/conversation.js";
import messageRoutes from "./routes/message.js";
import Message from "./models/Message.js";
import Conversation from "./models/Conversation.js";
import Call from "./models/Call.js";
import Employee from "./models/Employee.js";
import { decryptUserData } from "./verifyuser.js";
import callsRoutes from "./routes/calls.js";
// =========================
// ✅ App Initialization
// =========================
const app = express();
app.set("trust proxy", true);

// =========================
// ✅ Middleware Setup
// =========================
app.use(json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// =========================
// ✅ CORS Configuration
// =========================
const allowedOrigins = [
  "http://nothun.com",
  "https://nothun.com",
  "http://www.nothun.com",
  "https://www.nothun.com",
  "http://167.172.88.139",
  "https://167.172.88.139",
  "https://167.172.88.139:3000",
  "http://localhost:3000",
  "http://192.168.8.101:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow mobile apps or Postman
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// =========================
// ✅ API Routes
// =========================
app.use("/api/users", userRouter);
app.use("/api/addproduct", productData);
app.use("/api/slider", sliderAction);
app.use("/api/review", CustomerReview);
app.use("/api/order", AddOrder);
app.use("/api/contact", ContactTo);
app.use("/api/facebook", Facebook);
app.use("/api/banner", Banner);
app.use("/api/setgole", Setmytarget);
app.use("/api/newemplyee", AddEmplyee);
app.use("/api/newproduct", ClientAddProduct);
app.use("/api/conversation", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/calls", callsRoutes);
// =========================
// ✅ HTTP & Socket.IO Setup
// =========================
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUsers = new Map();

io.use((socket, next) => {
  const cookies = socket.handshake.headers.cookie;
  if (!cookies) return next(new Error("No cookies found"));

  const parsed = Object.fromEntries(
    cookies.split(";").map(c => c.trim().split("="))
  );

  const employeeCookie = parsed.employeeId;
  const companyCookie = parsed.companyId;

  if (!employeeCookie || !companyCookie) {
   console.error("❌ Cannot decrypt: value is missing");
    return next(new Error("Unauthorized"));
}

  const employeeSession = decryptUserData(employeeCookie);
  const companySession = decryptUserData(companyCookie);
  if (!employeeSession || !companySession) {
    console.log("❌ No employee id from cookie");
    return next(new Error("Unauthorized"));
  }

  socket.employeeId = employeeSession;
  socket.companyId = companySession || null;

  // Mark online
  onlineUsers.set(socket.employeeId, socket.id);

  console.log("🔐 Socket Authenticated:", socket.employeeId);

  next();
});

function socketIdForEmployee(employeeId) {
  return onlineUsers.get(String(employeeId));
}

//soket (io) end</>
io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);


  // Client explicitly joins a conversation room for efficient broadcasting
  socket.on("joinConversation", ({ conversationId }) => {
    if (!conversationId) return;
    socket.join(`conversation_${conversationId}`);
    console.log(conversationId);
    // optionally mark lastSeen for that conversation for this user
  });

  // Leave
  socket.on("leaveConversation", ({ conversationId }) => {
    if (!conversationId) return;
    socket.leave(`conversation_${conversationId}`);
  });

  // sendMessage via socket (server will persist)

  socket.on("sendMessage", async (payload, ack) => {
    // payload: { conversationId, senderId, messageType, content, mediaUrl, cloudinaryPublicId }
    try {
      const { conversationId, senderId, messageType = "text", content = "", mediaUrl = "", cloudinaryPublicId = "" } = payload;
      if (!conversationId || !senderId) {
        if (ack) ack({ ok: false, error: "conversationId and senderId required" });
        return;
      }

      // get conversation and company scope
      const conv = await Conversation.findById(conversationId).lean();
            console.log(conv);
      if (!conv) {
        if (ack) ack({ ok: false, error: "Conversation not found" });
        return;
      }

      // Persist message
      const msgDoc = await Message.create({
        companyId: conv.companyId,
        conversationId,
        senderId,
        messageType,
        content,
        mediaUrl,
        cloudinaryPublicId,
        status: "sent"
      });

      // Update conversation.lastMessage
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: { messageId: msgDoc._id, text: content || messageType, sentAt: msgDoc.createdAt },
        updatedAt: new Date()
      });

      // Broadcast to everyone in conversation room (efficient)
      io.to(`conversation_${conversationId}`).emit("newMessage", msgDoc);

      // Additionally, emit to individual online participants not in the room (if needed)
      // Notify offline/other participants via push or via REST later

      if (ack) ack({ ok: true, message: msgDoc });
    } catch (err) {
      console.error("socket sendMessage error:", err);
      if (ack) ack({ ok: false, error: "server error" });
    }
  });

  // Typing indicator
  socket.on("typing", ({ conversationId, employeeId, isTyping }) => {
    if (!conversationId) return;
    // broadcast to other members in the room
    socket.to(`conversation_${conversationId}`).emit("userTyping", { conversationId, employeeId, isTyping });
  });

  // Delivered
  socket.on("message:delivered", async ({ messageIds = [], employeeId }) => {
    try {
      if (!Array.isArray(messageIds) || !employeeId) return;
      // Update DB: push deliveredTo, set status if needed
      await Message.updateMany({ _id: { $in: messageIds }, deliveredTo: { $ne: employeeId } }, {
        $push: { deliveredTo: employeeId },
        $set: { status: "delivered" }
      });
      // notify sender(s)
      io.emit("messageDelivered", { messageIds, employeeId });
    } catch (err) {
      console.error("message:delivered error:", err);
    }
  });

  // Seen
  socket.on("message:seen", async ({ messageIds = [], employeeId }) => {
    try {
      if (!Array.isArray(messageIds) || !employeeId) return;
      await Message.updateMany({ _id: { $in: messageIds }, seenBy: { $ne: employeeId } }, {
        $push: { seenBy: employeeId },
        $set: { status: "seen" }
      });
      io.emit("messageSeen", { messageIds, employeeId });
    } catch (err) {
      console.error("message:seen error:", err);
    }
  });

  // --- CALL SIGNALING HANDLERS ---
// ------ Place this inside your io.on("connection", (socket) => { ... }) block ------

/**
 * Helper: get socket id for a given employeeId
 * (onlineUsers map stores employeeId -> socketId)
 */
//all previous <>
// Invite / create call (caller)
// socket.on("call:invite", async ({ to, callType = "video", conversationId = null, participants = [] }, ack) => {
//   try {
//     // 'to' may be single id or an array, but prefer participants array if provided
//     const toList = Array.isArray(participants) && participants.length > 0 ? participants : (Array.isArray(to) ? to : [to]);
//     const callerId = socket.employeeId;
//     if (!callerId) {
//       if (ack) ack({ ok: false, reason: "not_authenticated" });
//       return;
//     }

//     // create DB call record with caller included as participant
//     const callDoc = await Call.create({
//       companyId: socket.companyId,
//       callType,
//       participants: [
//         { employeeId: callerId, role: "caller", joinedAt: new Date() },
//         // Callees will be added as they answer; store planned participants too:
//         ...toList.map(t => ({ employeeId: t, role: "callee" }))
//       ],
//       callStatus: "ringing",
//       startedAt: new Date()
//     });

//     const callId = callDoc._id.toString();

//     // Notify each callee (if online). track which were notified
//     const notified = [];
//     for (const callee of toList) {
//       const calleeSocketId = socketIdForEmployee(callee);
//       if (calleeSocketId) {
//         io.to(calleeSocketId).emit("call:incoming", {
//           callId,
//           from: callerId,
//           fromName: socket.employeeName || "",
//           callType,
//           participants: toList,
//           conversationId
//         });
//         notified.push(callee);
//       }
//     }

//     // If nobody notified -> mark as missed/offline
//     if (notified.length === 0) {
//       await Call.findByIdAndUpdate(callId, { callStatus: "missed", endedAt: new Date() });
//       if (ack) ack({ ok: false, reason: "callee_offline" });
//       return;
//     }

//     if (ack) ack({ ok: true, callId, notified });
//   } catch (err) {
//     console.error("call:invite error:", err);
//     if (ack) ack({ ok: false, reason: "server_error" });
//   }
// });
//all prevous </>

// Invite participants
socket.on("call:invite", async ({ participants = [], callType = "video", conversationId = null }, ack) => {
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
          fromName: socket.employeeName || "",
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

// Forward SDP offer
socket.on("call:offer", ({ callId, to, sdp }, ack) => {
  const targetSocketId = socketIdForEmployee(to);
  if (!targetSocketId) return ack?.({ ok: false, reason: "target_offline" });

  io.to(targetSocketId).emit("call:offer", { callId, from: socket.employeeId, sdp });
  return ack?.({ ok: true });
});

// Forward SDP answer
socket.on("call:answer", async ({ callId, to, sdp }, ack) => {
  const targetSocketId = socketIdForEmployee(to);
  if (!targetSocketId) return ack?.({ ok: false, reason: "target_offline" });

  await Call.findByIdAndUpdate(callId, { callStatus: "ongoing" }).catch(() => {});
  io.to(targetSocketId).emit("call:answer", { callId, from: socket.employeeId, sdp });

  return ack?.({ ok: true });
});

// Forward ICE candidate
socket.on("call:ice", ({ callId, to, candidate }, ack) => {
  const targetSocketId = socketIdForEmployee(to);
  if (!targetSocketId) return ack?.({ ok: false, reason: "target_offline" });

  io.to(targetSocketId).emit("call:ice", { callId, from: socket.employeeId, candidate });
  return ack?.({ ok: true });
});

// End call
socket.on("call:end", async ({ callId, reason = "hangup" }, ack) => {
  if (callId) {
    await Call.findByIdAndUpdate(callId, { callStatus: reason === "hangup" ? "ended" : reason, endedAt: new Date() }).catch(() => {});
  }

  // Notify only participants (you can fetch them from DB)
  const call = await Call.findById(callId);
  if (call) {
    call.participants.forEach(p => {
      if (p.employeeId !== socket.employeeId) {
        const socketId = socketIdForEmployee(p.employeeId);
        if (socketId) io.to(socketId).emit("call:end", { callId, reason, from: socket.employeeId });
      }
    });
  }

  return ack?.({ ok: true });
});

// Forward SDP offer (from caller -> callee)
socket.on("call:offer", ({ callId, to, sdp }, ack) => {
  try {
    const targetSocketId = socketIdForEmployee(to);
    if (!targetSocketId) {
      if (ack) ack({ ok: false, reason: "target_offline" });
      return;
    }
    // include 'from' so callee can know who sent the offer
    io.to(targetSocketId).emit("call:offer", { callId, from: socket.employeeId, to, sdp });
    if (ack) ack({ ok: true });
  } catch (err) {
    console.error("call:offer error:", err);
    if (ack) ack({ ok: false });
  }
});

// Forward SDP answer (callee -> caller)
socket.on("call:answer", async ({ callId, to, sdp }, ack) => {
  try {
    const targetSocketId = socketIdForEmployee(to);
    if (!targetSocketId) {
      if (ack) ack({ ok: false, reason: "target_offline" });
      return;
    }

    // update call status to ongoing when first answer occurs
    await Call.findByIdAndUpdate(callId, { callStatus: "ongoing" }).catch(() => {});

    io.to(targetSocketId).emit("call:answer", { callId, from: socket.employeeId, to, sdp });
    if (ack) ack({ ok: true });
  } catch (err) {
    console.error("call:answer error:", err);
    if (ack) ack({ ok: false });
  }
});

// Forward ICE candidate
socket.on("call:ice", ({ callId, to, candidate }, ack) => {
  try {
    const targetSocketId = socketIdForEmployee(to);
    if (!targetSocketId) {
      if (ack) ack({ ok: false, reason: "target_offline" });
      return;
    }
    io.to(targetSocketId).emit("call:ice", { callId, from: socket.employeeId, to, candidate });
    if (ack) ack({ ok: true });
  } catch (err) {
    console.error("call:ice error:", err);
    if (ack) ack({ ok: false });
  }
});

// End call (any participant)
socket.on("call:end", async ({ callId, reason = "hangup" }, ack) => {
  try {
    if (callId) {
      await Call.findByIdAndUpdate(callId, { callStatus: reason === "hangup" ? "ended" : reason, endedAt: new Date() }).catch(() => {});
    }

    // Broadcast end to all participants (you can also limit to online ones)
    io.emit("call:end", { callId, reason, from: socket.employeeId });

    if (ack) ack({ ok: true });
  } catch (err) {
    console.error("call:end error:", err);
    if (ack) ack({ ok: false });
  }
});

// -----------------------------------------------------------------------

  // Disconnect
  socket.on("disconnect", () => {
    // remove from onlineUsers
    if (socket.employeeId) {
      for (const [empId, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          onlineUsers.delete(empId);
          break;
        }
      }
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    }
    console.log("socket disconnected:", socket.id);
  });
});
// soket (io) end</>

// Mount live chat route (after io is initialized)

// =========================
// ✅ Web Push Configuration
// =========================
webpush.setVapidDetails(
  "mailto:nothun.nt@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// =========================
// ✅ MongoDB Connection
// =========================
const mongoDB = process.env.MONGO_URL;
set("strictQuery", false);

connect(mongoDB)
  .then(() => console.log("✅ Database connection successful"))
  .catch((err) => console.error("❌ Database connection error:", err));

// =========================
// ✅ Start Server
// =========================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
