import mongoose from "mongoose";
const { Schema } = mongoose;

const mediaSchema = new Schema(
  {
    uploaderId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    type: { type: String, enum: ["image", "video", "audio", "file"], required: true },
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    size: { type: Number }, // bytes
  },
  { timestamps: true }
);

export default mongoose.model("Media", mediaSchema);