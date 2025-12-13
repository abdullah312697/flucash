// models/Subscription.js
import { Schema, model } from "mongoose";

const SubscriptionSchema = new Schema({
  endpoint: { type: String, unique: true },  // still unique per device
  keys: {
    p256dh: String,
    auth:   String
  },
  owner: String   // no unique here
});


export default model("Subscription", SubscriptionSchema);
