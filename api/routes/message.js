// routes/message.js
import express from "express";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import{decryptUserData} from '../verifyuser.js';
import multerProcess from '../multerMiddleware.js';
import { uploadImage } from '../cloudinary.js';
import { deleteResorce } from '../cloudinaryDelete.js';
import multerVideoProcess from '../multerVideo.js';
import multerMultpleSameField from '../multerMSameField.js';

const router = express.Router();

/**
 * Send a new message
 * body: { conversationId, messageType, content, mediaUrl?, cloudinaryPublicId? }
 */
router.post("/newMessage", async (req, res) => {
    multerProcess(req, res, async (err) => {
        if (err) {
            return res.json({message:err.message});
        }
  try {
    const { companyId } = req.cookies;
    if (!companyId) return res.status(401).json({ message: "Unauthorized" });
    const companyIdDecripted = decryptUserData(companyId);
    // const files = req.file;
    const { conversationId, senderId, content} = req.body;
    if (!conversationId || !senderId) {
      return res.status(400).json({ message: "conversationId and senderId required" });
    }

    // if(files){
    //   const imageStream = req.file.buffer;
    //     const fileType = files.mimetype; // MIME type of the file
    //     const imageName = new Date().getTime().toString();
    //     const uploadResult = await uploadImage(imageStream, imageName, "messageFile", fileType);
    //     const mediaUrl = await uploadResult.secure_url;
    //     const cloudinaryPublicId  = await uploadResult.public_id;
    // }

    // Create new message
    const message = await Message.create({
      companyId : companyIdDecripted,
      conversationId,
      senderId,
      content,
    });

    // Update conversation’s lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        messageId: message._id,
        text: content || messageType,
        sentAt: message.createdAt
      }
    });

    return res.status(201).json({ message: "Message sent", data: message });
  } catch (err) {
    console.error("send message error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
      });
});

/**
 * Fetch messages in a conversation with pagination
 * query: ?page=1&limit=20
 */
router.get("/:conversationId", async (req, res) => {
  try {
    const { companyId } = req.cookies;
    if (!companyId) return res.status(401).json({ message: "Unauthorized" });
    const companyIdDecripted = decryptUserData(companyId);

    const { conversationId } = req.params;
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);
    const skip = (page - 1) * limit;

    const messages = await Message.find({ companyId: companyIdDecripted, conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({ data: messages.reverse(), page, limit });
  } catch (err) {
    console.error("fetch messages error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * Mark message(s) as delivered
 * body: { messageIds: [], employeeId }
 */
router.put("/delivered", async (req, res) => {
  try {
    const { messageIds, employeeId } = req.body;
    if (!Array.isArray(messageIds) || !employeeId)
      return res.status(400).json({ message: "messageIds[] and employeeId required" });

    await Message.updateMany(
      { _id: { $in: messageIds }, deliveredTo: { $ne: employeeId } },
      { $push: { deliveredTo: employeeId }, $set: { status: "delivered" } }
    );

    return res.status(200).json({ message: "Messages marked delivered" });
  } catch (err) {
    console.error("deliver update error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * Mark messages as seen
 * body: { messageIds: [], employeeId }
 */
router.put("/seen", async (req, res) => {
  try {
    const { messageIds, employeeId } = req.body;
    if (!Array.isArray(messageIds) || !employeeId)
      return res.status(400).json({ message: "messageIds[] and employeeId required" });

    await Message.updateMany(
      { _id: { $in: messageIds }, seenBy: { $ne: employeeId } },
      { $push: { seenBy: employeeId }, $set: { status: "seen" } }
    );

    return res.status(200).json({ message: "Messages marked seen" });
  } catch (err) {
    console.error("seen update error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;