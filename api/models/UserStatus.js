import mongoose from "mongoose";
const { Schema } = mongoose;

const userStatusSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Employee", unique: true },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    typing: {
      conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
      isTyping: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserStatus", userStatusSchema);
