import express from 'express';
const router = express.Router();
import Companies from "../models/Companies.js";
import kingAdmin from "../models/KingUser.js";
import { createTransport } from 'nodemailer';
import{encryptUserData,decryptUserData,encryptCompanyPassword,decryptCompanyPassword} from '../verifyuser.js';

function validateCookie(req, res, next) {
    const { userCookie } = req.cookies;
    if (!userCookie) {
        return res.status(401).json({message:'Access Denied: No cookie found'});
    }
    try {
        const decryptedData = decryptUserData(userCookie);
        const parsedData = JSON.parse(decryptedData);
        if (parsedData.role === 'allowedRole') {
            req.user = parsedData;
            next();
        } else {
            return res.status(403).json({message:'Access Denied: Invalid role'});
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({message:'Invalid cookie data'});
    }
}

//user register<>
router.post("/register", async(req,res) => {
    const {companyName,industry,companyEmail,companyPassword,rePassword,verifyCode,numberofEmployees} = req.body;
    try{
        const estr = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if(companyName === "" ||   industry === "" ||   companyEmail === "" ||
            companyPassword === "" || numberofEmployees === "" || rePassword === ""){
            return res.status(400).json({message:"Filed must not be Empty!"});
        }else if(!companyEmail.match(estr)){
            return res.status(400).json({message:"Email is Invalid!"});
        }else if(await Companies.findOne({"companyEmail":companyEmail}).exec()){
            return res.status(409).json({message:"Email is already exists!"});         
        }else if(companyPassword.length < 8){
            return res.status(400).json({message:"Password must be at least 8 characters."});
        }else if(!companyPassword.match(strongPasswordRegex)){
            return res.status(400).json({message:"Password must have (A-Z, a-z, 1-9, @,$,!)"});
        }else if(companyPassword !== rePassword){
            return res.status(400).json({message:"Password not Match!"});
        }else{
            const newUser = new Companies({
                companyName,
                industry,
                companyEmail,
                numberofEmployees,
                companyPassword:encryptCompanyPassword(companyPassword),
                verifyCode
            });
            const saveUser = await newUser.save();
            if (!saveUser) {
                return res.status(500).json({message:"Failed to create user"});
            }
            const oneYearInSeconds = 365 * 24 * 60 * 60;
            if(saveUser){
                const transporter = createTransport({
                    service : "gmail",
                    port:587,
                    secure:false,
                    auth: {
                        user : process.env.EMAIL_USER,
                        pass : process.env.EMAIL_PASS
                    }
                });
                const mailOptions = {
                    from : "nothun.ecommerce@gmail.com",
                    to: companyEmail,
                    subject: "Verify your Email Address",
                    html: `
                        <div style="background-color:#011627;max-width:100%;height:auto;padding:30px 0px;border-radius:10px">
                            <div style="width:100%;height:60px;border-bottom:1px solid #ccc;text-align:center;color:#ff9900;"><h1>Nothun.com</h1></div>
                            <h2 style="color:#fff;text-align:center;margin-top:50px;">Your Verification Code is:</h2>
                            <h3 style="color:#ffa500;font-size: 30px;
                            width: 270px;
                            margin: 0 auto;
                            height: 100px;
                            border: 1px solid #ccc;
                            border-radius: 5px;
                            margin-top: 50px;
                            text-align: center;
                            line-height: 75px;
                            ">${verifyCode}</h3>
                            <div style="width:100%;height:60px;border-top:1px solid #ccc;text-align:center;color:#fff;margin-top:50px;padding-top:30px">&copy; 2024 Nothun. All rights reserved.</div>
                        </div>
                            `
                };
                transporter.sendMail(mailOptions, async(err, info) => {
                    try{
                    if (err) {
                        console.error("Email sending error:", err);
                        return res.status(500).json({ message: "Failed to send Email" });
                    }else{
                        const encryptedData = encryptUserData(saveUser._id.toString());
                        return res.status(200).cookie(
                            "userId",encryptedData,
                            {
                            path: '/',
                            httpOnly: true,
                            maxAge: oneYearInSeconds * 1000 // Convert seconds to milliseconds
                            }
                        ).json({data:saveUser, message:"Verify Your Email!"});
                    }
                    }catch(error){
                        console.error("Response error:", error);
                        res.status(500).json({ message: "Unexpected error occurred" });
                    }
                });
            }
        }
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Something went wrong"});
    }
});
//user register</>

//sende a vefiry code<>
router.post("/verifyCode", async(req,res) => {
    const {userId} = req.cookies;
    const DuserId = decryptUserData(userId);
    const vfCode = req.body.verifyCode;
    try{
        if(vfCode === "" || vfCode.length < 6){
            return res.status(400).json({message:"field must not be empty!"});
        }else{
            const userData = await Companies.findById(DuserId);
             if(userData.verifyCode !== Number(vfCode)){
               return res.status(400).json({message:"verification code is wrong!"});
            }else{
                const setVf = await Companies.findByIdAndUpdate(DuserId,{isVerify:true},{new:true}).select("fullname gender phone isVerify email");
                if(setVf){
                    return res.status(200).json({message:"Email Verify Successfully!"});
                }
            }
        }
    }catch(e){
        console.log(e);
        return res.status(500).json({message:"Something went wrong"});
    } 
});
//sende a vefiry code</>
//update vefiry code<>
router.put("/updateVfCode", async(req,res) => {
    const {userId} = req.cookies;
    const DuserId = decryptUserData(userId);
    const vfCode = Number(req.body.verifyCode);
    try{
        const geUptd = await Companies.findByIdAndUpdate(DuserId, {verifyCode:vfCode},{new:true});
        if(geUptd){
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
                to: geUptd.companyEmail,
                subject: "Verify your Email Address",
                html: `
                    <div style="background-color:#011627;max-width:100%;height:auto;padding:30px 0px;border-radius:10px">
                        <div style="width:100%;height:60px;border-bottom:1px solid #ccc;text-align:center;color:#ff9900;"><h1>Nothun.com</h1></div>
                        <h2 style="color:#fff;text-align:center;margin-top:50px;">Your Verification Code is:</h2>
                        <h3 style="color:#ffa500;font-size: 30px;
                        width: 270px;
                        margin: 0 auto;
                        height: 100px;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                        margin-top: 50px;
                        text-align: center;
                        line-height: 75px;
                        ">${vfCode}</h3>
                        <div style="width:100%;height:60px;border-top:1px solid #ccc;text-align:center;color:#fff;margin-top:50px;padding-top:30px">&copy; 2024 Nothun. All rights reserved.</div>
                    </div>
                        `
            };

            transporter.sendMail(mailOptions, (err) => {
                if(err){
                    console.log(err);
                   return res.status(500).json({message:"Failed to resend verification code!"});
                }else{
                   return res.status(200).json({message:"Resend verification code!"});
                }
            });

        }
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Something went wrong"});
    }

});
//update vefiry code</>
//check if user email vefiry or not<>
router.get("/vefiryUsers", async(req,res) => {
    try{
    const {userId} = req.cookies;
    const DuserId = decryptUserData(userId);
    if(!userId){
        return res.status(400).json({message:"usrId not found"});
    }else{
        const checkisVarify = await Companies.findById(DuserId);
        if(checkisVarify.isVerify === true){
            return res.status(400).json({message:"usrId not found"});
        }else{
            return res.status(200).json({message:"usrId found"});
        }
    }
    }catch(error){
        console.log(error);
        return res.status(500).json({message:"Something went wrong"});
    }
});
//check if user email vefiry or not</>
//vefiry if user log or not<>
router.get("/vefiryUsersLog", async(req,res) => {
    try{
    const {userId} = req.cookies;
    if(userId){
        return res.status(200).json({message:"usrId found"});
    }else{
        return res.status(400).json({message:"usrId not found"});
    }
    }catch(error){
        console.log(error);
        return res.status(500).json({message:"Something went wrong"});
    }
});
//vefiry if user log or not</>
//user login <>
router.post("/useLogin", async(req,res) => {
    try{
        const EmailCP = req.body.companyEmail;
        if(req.body.companyEmail === "" || req.body.companyPassword === ""){
            return res.status(400).json({message:"Filed must not be Empty!"});
        }else{
            await Companies.findOne({companyEmail:req.body.companyEmail}).then((user) => {
                if(!user){
                    return res.status(400).json({message:"Email or password not match!"});
                }else{
                        const encrypteuserID = encryptUserData(user._id.toString());
                        const dbPass = decryptCompanyPassword(user.companyPassword);
                        if(req.body.companyPassword !== dbPass){
                            return res.status(400).json({message:"Email or password not match!"})
                        }else{
                        const oneYearInSeconds = 365 * 24 * 60 * 60;
                        return res.status(200).cookie(
                            "userId",encrypteuserID,
                            {
                            path: '/',
                            secure: true,
                            httpOnly: true,
                            sameSite: 'Strict',
                            maxAge: oneYearInSeconds * 1000 // Convert seconds to milliseconds
                            }
                        ).json({message:"Login Successfullay!"});
                    }
                    }
                })
        }
    }catch(e){
        console.log(e)
        return res.status(500).json({message:"Something went wrong"});
    }
});
//user login </>
//admin user login <>
router.post("/king_userLogin", async(req,res) => {
    try{
        if(req.body.email === "" || req.body.password === ""){
            return res.status(400).json({message:"Filed must not be Empty!"});
        }else{
            await kingAdmin.findOne({king_email:req.body.email}).then((user) => {
                if(!user){
                    return res.status(400).json({message:"Email or password not match!"})
                }else{
                        if(req.body.password !== user.king_pass){
                            return res.status(400).json({message:"Email or password not match!"})
                        }else{
                        const KingUserEnc = encryptUserData(user._id.toString());
                        const oneYearInSeconds = 365 * 24 * 60 * 60;        
                        return res.status(200)
                            .cookie("king_userId", KingUserEnc, {
                                httpOnly: true,
                                secure: true,
                                sameSite: 'Strict',
                                maxAge: oneYearInSeconds * 1000 // Convert seconds to milliseconds
                            })
                            .cookie("accessRule", user.accessRule, {
                                httpOnly: true,
                                secure: true,
                                sameSite: 'Strict',
                                maxAge: oneYearInSeconds * 1000 // Convert seconds to milliseconds
                            })
                            .json({kingUser:user, message:"Login Successful!"});                         
                    }
                    }
                })
        }
    }catch(e){
        console.log(e);
        return res.status(500).json({message:"Something went wrong"});
    }
});
//admin user login </>
//vefiry if user log or not<>
router.get("/vefiryKingUsersLog", async(req,res) => {
    try{
        const {king_userId, accessRule} = req.cookies;
        if(king_userId && accessRule){
            return res.status(200).json(accessRule);
        }else{
            return res.status(400).json(accessRule);
        }
    }catch(error){
        console.log(error);
        return res.status(500).json({message:"Something went wrong"});
    }
});
//vefiry if user log or not</>

//user logout <>
router.get("/logOut",(req,res)=>{
    try{
        const clrCookie = res.clearCookie("userId");
        if(clrCookie){
            return res.status(200).json({message:"you are loged out!"});
        }else{
            return res.status(400).json({message:"something wrong!"});
        }

    }catch(e){
        console.log(e);
        return res.status(500).json({message:"Something went wrong"});
    }
});
//user logout </>

//user profile data get <>
router.get("/userProfileData",async(req,res) => {
    const {userId} = req.cookies;
    const DuserId = decryptUserData(userId);
    try{
        const userData = await Companies.findById(DuserId).select("fullname email isVerify gender phone");
        if(userData){            
            return res.status(200).json(userData);
        }else{
            return res.status(400).json({message:"data not found!"});
        }
    }catch(e){
        console.log(e);
        return res.status(500).json({message:"Something went wrong"});
    }
});
//user profile data get </>
//user order add to cart <>
// router.put("/addToCart",async(req,res) => {
//     try{
//         const userData = await Companies.findById(userId);
//         if(userData){            
//            return res.status(200).json(userData);
//         }else{
//             return res.status(400).json({message:"data not found!"});
//         }
//     }catch(e){
//         console.log(e);
//         return res.status(500).json({message:"Something went wrong"});
//     }
// });
//user order add to cart </>

export default router;