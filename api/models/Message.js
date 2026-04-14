// models/Message.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const messageSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Companies", required: true },
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },

  messageType: { type: String, enum: ["text","image","video","audio","pdf","word","excel","powerpoint","archive","file"], default: "text" },
  content: { type: String, default: "" },

  media: [
  {
    mediaUrl: String,
    cloudinaryPublicId: String,
    messageType: String,
    fullName: String
  }
],
  status: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent",
  },

  deliveredTo: [{ type: Schema.Types.ObjectId, ref: "Employee" }],
  seenBy: [{ type: Schema.Types.ObjectId, ref: "Employee" }],
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

export default mongoose.model("Message", messageSchema);
