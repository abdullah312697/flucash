import mongoose from "mongoose";
const { Schema } = mongoose;

const contactSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    contactId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    nickname: { type: String },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);
