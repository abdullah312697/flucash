import express from 'express';
const router = express.Router();
import Contact from '../models/Contact.js';
import { createTransport } from 'nodemailer';

// add new order <>
router.post("/addNewContact", async(req,res) => {
    try {
        const allData = req.body;
        if(allData.fullname === "" || allData.email === "" || allData.phone === "" ||
            allData.comment === ""
        ){
            res.status(201).json("Field must not be Empty!")
        }else{
            const uploadData = new Contact(allData);        
            const savedData = await uploadData.save();
            if(savedData){
                res.status(200).json("Thanks, We will contact you soon!");
            }
        }
    }catch (error) {
        console.log(error);
        return res.status(201).json("Failed to send Email!");
    }
});
//add new order </>
//getAllmessages <>
    router.get("/getAllmessages", async(req,res) => {
        try{
            const allMessages = await Contact.find({});
            res.status(200).json(allMessages);
        }catch (error) {
            console.log(error);
            return res.status(201).json("Faild to retrive messages");
        }
    });
//getAllmessages </>
//reply messages <>
router.put("/replayMessage/:replayId", async(req,res) => {
    const {replayId} = req.params;
    const {sendReply} = req.body;
    try {
            const isReply = await Contact.findByIdAndUpdate(replayId,{$set:{replay:sendReply}},{new:true,upsert:true});
            if(isReply){
                res.status(200).json('Reply send successfully');
                const transporter = createTransport({
                    service : "gmail",
                    port:587,
                    secure:false,
                    auth: {
                        user : "nothun.ecommerce@gmail.com",
                        pass : "ugbsamafjwcfkerp"
                    }
                });

                const mailOptions = {
                    from : "nothun.ecommerce@gmail.com",
                    to: isReply.email,
                    subject: "Nothun: Here’s What You Need to Know",
                    html: `
    <div style="background-color:#011627;max-width:100%;height:auto;padding:30px 0px;border-radius:10px">
        <div style="width:100%;height:60px;border-bottom:1px solid #ccc6;text-align:center;color:#ff9900;">
            <h1 style="font-family: sans-serif;color:#ff9900;">NOTHUN</h1>
        </div>
        <div style="width: 100%;height: auto;box-sizing: border-box;padding: 40px;color: #ccc9;">
            <div style="width: 100%; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #ccc6;">
                <h2 style="color:#ff9900; margin: 0; margin-bottom: 10px;">Dear ${isReply.fullname}</h2>
                <h4 style="margin: 0; margin-bottom: 10px; font-size: 10px;color:#ffb100">Thank you for reaching out to us and expressing your interest in our products! 
                We appreciate your inquiry and are excited to provide you with more information.</h4>
            </div>
            <div style="width: 100%; font-size:12px; padding-bottom:15px; height: auto; margin-bottom: 20px; border-bottom: 1px solid #ccc6;">
                    ${isReply.replay}
            </div>
            <div style="width: 100%; height: auto; margin-bottom: 15px; border-bottom: 1px solid #ccc6; padding-bottom: 15px;">
                <span style="margin-bottom: 10px; display: block;color:#ffb100"><b style="color: #ccccccc9;">Customer Support: </b>If you have any questions or need further assistance, please feel free to contact us at nothun.ecommerce@gmail.com or <a href="https://www.notuhun.com/contact">nothun.com</a></span>
                <span style="margin-bottom: 10px; display: block;color:#ffb100">Thank you for choosing <a href="http://www.nothun.com">nothun.com</a>. We look forward to serving you again!</span>
            </div>
            <div style="width: 100%; height: auto; margin-bottom: 15px;">
                <span style="margin-bottom: 10px;font-weight: bold;display: block;color: #ccccccc9;">
                    Best regards,</span>
                <span style="margin-bottom: 10px;display: block;color:#ffb100">Mohtasim Rahman</span>
                <span style="margin-bottom: 10px;display: block;color:#ffb100">Customer Service Representative</span>
                <span style="margin-bottom: 10px;display: block;color:#ffb100">Nothun</span>
                <span style="margin-bottom: 10px;display: block;"><a href="http://www.nothun.com">nothun.com</a></span>
            </div>
        </div>
        <div style="width:100%;height:60px;border-top:1px solid #ccc6;text-align:center;color:#df8807ba;line-height: 100px;">&copy; 2024 Nothun. All rights reserved.</div>
    </div>
    `
                };
                transporter.sendMail(mailOptions, (err) => {
                    if(err){
                        console.log(err);
                    }else{
                        console.log("Email is send succussfully!");
                    }
                });
            }else{
                res.status(501).json("faild to send you reply!");
            }
    }catch (error) {
        console.log(error);
        return res.status(201).json("Failed to send Email!");
    }
});
//reply messages </>
//Delete messages <>
router.delete("/deleteMessage/:deleteId", async(req,res) => {
    const {deleteId} = req.params;
    try {
            const isDelete = await Contact.findByIdAndDelete(deleteId);
            if(isDelete){
                res.status(200).json({data:isDelete,message:"Successfully Deleted!"});
            }else{
                res.status(501).json("Message Can't Deleted!");
            }
    }catch (error) {
        console.log(error);
        return res.status(201).json("Failed to send Email!");
    }
});
//Delete messages </>

export default router;