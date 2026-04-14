import Message from "../models/Message.js";

const registerMessageEvents = (io, socket) => {

  socket.on("joinConversation", ({ conversationId }) => {
    if (!conversationId) return;
    console.log(conversationId);
    socket.join(`conversation_${conversationId}`);
  });

  // Leave
  socket.on("leaveConversation", ({ conversationId }) => {
    if (!conversationId) return;
    socket.leave(`conversation_${conversationId}`);
  });

  // sendMessage via socket (server will persist)

//   socket.on("sendMessage", async (payload, ack) => {
//     try {
//       const msgDoc = payload;
//       console.log(msgDoc);
//       io.to(`conversation_${msgDoc.conversationId}`).emit("newMessage", msgDoc);
//       if (ack) ack({ ok: true, message: msgDoc });
//     } catch (err) {
//       console.error("socket sendMessage error:", err);
//       if (ack) ack({ ok: false, error: "server error" });
//     }
//   });

  // Typing indicator
  socket.on("typing", ({conversationId, employeeId, isTyping }) => {
    if (!conversationId) return;
    socket.to(`conversation_${conversationId}`).emit("userTyping", { isTyping });
  });

  // Delivered
  socket.on("message:delivered", async ({ messageIds = [], employeeId, conversationId }) => {
    try {
      if (!Array.isArray(messageIds) || !employeeId) return;
      await Message.updateMany(
        { _id: { $in: messageIds }, deliveredTo: { $ne: employeeId } },
        {
          $addToSet: { deliveredTo: employeeId }
        }
      );
      // notify sender(s)
      io.to(`conversation_${conversationId}`).emit("messageDelivered", { messageIds, employeeId });

    } catch (err) {
      console.error("message:delivered error:", err);
    }
  });

  // Seen
  socket.on("message:seen", async ({ messageIds = [], employeeId, conversationId }) => {
    try {
      if (!Array.isArray(messageIds) || !employeeId) return;
      await Message.updateMany(
        { _id: { $in: messageIds }, seenBy: { $ne: employeeId } },
        {
          $addToSet: { seenBy: employeeId }
        }
      );
      io.to(`conversation_${conversationId}`).emit("messageSeen", { messageIds, employeeId });
    } catch (err) {
      console.error("message:seen error:", err);
    }
  });

}

export default registerMessageEvents;