// models/Call.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const callParticipantSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: "Employee" },
  role: { type: String, enum: ["caller", "callee"], required: true },
  joinedAt: Date,
  leftAt: Date,
}, { _id: false });

const CallSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Companies", required: true },
  callType: { type: String, enum: ["audio", "video"], required: true },
  participants: { type: [callParticipantSchema], default: [] },
  callStatus: { type: String, enum: ["initiated","ringing","ongoing","ended","missed","rejected"], default: "initiated" },
  startedAt: Date,
  endedAt: Date,
  duration: { type: Number, default: 0 } // seconds
}, { timestamps: true });

export default mongoose.model("Call", CallSchema);
