// routes/calls.js
import express from "express";
import Call from "../models/Call.js";
import { decryptUserData } from "../verifyuser.js";
const router = express.Router();

// Get recent calls for the current company (or optionally filter by employee)
router.get("/", async (req, res) => {
  try {
    const companyCookie = req.cookies.companyId;
    if (!companyCookie) return res.status(401).json({ message: "Unauthorized" });

    const company = decryptUserData(companyCookie);
    if (!company) return res.status(401).json({ message: "Unauthorized" });

    // company might be string id (because we stored only id)
    const companyId = typeof company === "string" ? company : company.id || company;

    const calls = await Call.find({ companyId })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return res.json(calls);
  } catch (err) {
    console.error("GET /api/calls error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get single call info
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const call = await Call.findById(id).lean();
    if (!call) return res.status(404).json({ message: "Call not found" });
    return res.json(call);
  } catch (err) {
    console.error("GET /api/calls/:id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
