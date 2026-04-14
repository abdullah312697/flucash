import express from 'express';
const router = express.Router();
import Companies from "../models/Companies.js";
import Employee from "../models/Employee.js";
import kingAdmin from "../models/KingUser.js";
import { createTransport } from 'nodemailer';
import{encryptUserData,decryptUserData,encryptCompanyPassword,decryptCompanyPassword} from '../verifyuser.js';
import multerProcess from '../multerMiddleware.js';
import { uploadImage } from '../cloudinary.js';

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
      multerProcess(req, res, async (err) => {
if (err) return res.status(400).json({ message: err.message });
    try{
    const {companyName,industry,companyEmail,companyPassword,rePassword,verifyCode,numberofEmployees} = req.body;
        console.log(req.files);        
        console.log(req.body);        
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
        }else if (req.files.length === 0) {
            return res.status(400).json({ message: "Please upload a Company Profile/Logo" });
        }else {
                  const file = req.files[0];
                  const uploadResult = await uploadImage(
                    file.buffer,
                    Date.now().toString(),
                    "CompanyLogo",
                  );
                        
             const employeePass = encryptCompanyPassword(companyPassword);
            const newUser = {
                companyName,
                industry,
                companyEmail,
                numberofEmployees,
                companyPassword:employeePass,
                verifyCode,
                companyLogo: uploadResult.secure_url,
                CloudinaryPublicId: uploadResult.public_id,
            };
            const saveUser = await Companies.create(newUser);
             const companyId = saveUser._id.toString();
            const EmplyeeData = {
                companyId: companyId,
                YemplyeeEmail : companyEmail,
                employeeAccessPassword : employeePass,
            };
            const newEmployee = await Employee.create(EmplyeeData);
            if (!saveUser || !newEmployee) {
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
                        const companyIdEnc = encryptUserData(companyId);
                        const employeeIdEnc = encryptUserData(newEmployee._id.toString());
                        const AccessData = {
                            companyName:saveUser.companyName, 
                            companyLogo:saveUser.companyLogo,
                            isVerify: saveUser.isVerify,
                        };
                        return res.status(200).cookie(
                            "companyId",companyIdEnc,
                            {
                            httpOnly: true,
                            secure:true,
                            sameSite: "none", 
                            maxAge: oneYearInSeconds * 1000 // Convert seconds to milliseconds
                            }
                        ).cookie(
                        "employeeId",employeeIdEnc,
                            {
                            httpOnly: true,
                            secure:true,
                            sameSite: "none", 
                            maxAge: oneYearInSeconds * 1000 // Convert seconds to milliseconds
                            }
                        ).json({
                                message:"Verify Your Email!",
                                AccessData
                            });
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
});
//user register</>

//sende a vefiry code<>
router.post("/verifyCode", async (req, res) => {
  try {
    const { companyId, employeeId } = req.cookies;
    const { verifyCode } = req.body;

    // -------------------------
    // 1. Validate cookies exist
    //--------------------------
    if (!companyId || !employeeId) {
      return res.status(400).json({ message: "Please login or register!" });
    }

    // -------------------------
    // 2. Decrypt IDs
    //--------------------------
    const decryptedCompanyId = decryptUserData(companyId);
    const decryptedEmployeeId = decryptUserData(employeeId);

    if (!decryptedCompanyId || !decryptedEmployeeId) {
      return res.status(400).json({ message: "Invalid or expired session!" });
    }

    // -------------------------
    // 3. Validate input
    //--------------------------
    if (!verifyCode || verifyCode.length !== 6) {
      return res.status(400).json({ message: "Verification code must be 6 digits!" });
    }

    // -------------------------
    // 4. Find Company
    //--------------------------
    const company = await Companies.findById(decryptedCompanyId).select("-companyPassword");
    if (!company) {
      return res.status(404).json({ message: "Company not found!" });
    }

    if (company.verifyCode !== Number(verifyCode)) {
      return res.status(400).json({ message: "Incorrect verification code!" });
    }

    // -------------------------
    // 5. Find Employee
    //--------------------------
    const employee = await Employee.findById(decryptedEmployeeId).select("-employeeAccessPassword");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found!" });
    }

    // -------------------------
    // 6. Verify email (update DB)
    //--------------------------
    await Companies.findByIdAndUpdate(decryptedCompanyId, {
      $set: {
        isVerify: true,  // important: mark verified!
        verifyCode: null // remove code after verification
      }
    });

    // -------------------------
    // 7. Prepare AccessData for AuthContext
    //--------------------------
    const AccessData = {
    
      companyName: company.companyName,
      companyLogo: company.companyLogo,
      employeeId: employee._id,
      employeeName: employee.YemplyeeName,
      employeeRoal: employee.EmplyeeRoal,
      employeeProfile: employee.EmplyeeProfile,
      isVerify: company.isVerify,
    };

    return res.status(200).json({
      message: "Email verified successfully!",
      AccessData,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});
//sende a vefiry code</>
//update vefiry code<>
router.put("/updateVfCode", async(req,res) => {
    const {companyId} = req.cookies;
    const DecreptedCompanyId = decryptUserData(companyId);
    const vfCode = Number(req.body.verifyCode);
    try{
        const geUptd = await Companies.findByIdAndUpdate(DecreptedCompanyId, {verifyCode:vfCode},{new:true});
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


//vefiry if user log or not<>
router.get("/vefiryUsersLog", async(req,res) => {
    try{
    const { companyId, employeeId } = req.cookies;
    // Check if cookies exist
    if (!companyId || !employeeId) {
      return res.status(400).json({ message: "Please login or register!" });
    }
        // Decrypt IDs
    const decryptedCompanyId = decryptUserData(companyId);
    const decryptedEmployeeId = decryptUserData(employeeId);

        const company = await Companies.findById(decryptedCompanyId).select("-companyPassword");

        if(!company){
            return res.status(400).json({message:"Register your Company please!"});
        }

        if(!company.isVerify){
            return res.status(400).json({message:"Verify your email"});
        }

    // Find employee
    const employee = await Employee.findById(decryptedEmployeeId).select("-employeeAccessPassword");
    if (!employee || !company) {
      return res.status(400).json({ message: "Not Found or not registered!" });
    }
    // Validate company ID
    if (employee.companyId.toString() !== decryptedCompanyId.toString()) {
      return res.status(400).json({ message: "Company and employee do not match!" });
    }
        const AccessData = {
          companyName:company.companyName,
          companyLogo:company.companyLogo,
          employeeId: employee._id,
          employeeName: employee.YemplyeeName,
          employeeRoal: employee.EmplyeeRoal,
          employeeProfile: employee.EmplyeeProfile,
          isVerify: company.isVerify,
      }
    // Success
    return res.status(200).json({ message: "Company and employee verified successfully.", AccessData});
}catch(error){
        console.log(error);
        return res.status(500).json({message:"Something went wrong"});
    }
});
//vefiry if user log or not</>

router.post("/useLogin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Fields must not be empty!" });
    }
    let employee = await Employee.findOne({ YemplyeeEmail: email });
    if (!employee) {
      return res.status(400).json({ message: "Email or password not match!" });
    }
      const dbPass = decryptCompanyPassword(employee.employeeAccessPassword);
      if (password !== dbPass) {
        return res.status(400).json({ message: "Email or password not match!" });
      }
      const comIdStr = employee.companyId.toString();
      const EmployeeComData = await Companies.findById(comIdStr);
      if(!EmployeeComData){
        return res.status(400).json({message:"something wrong!"})
      }
      const encryptedId = encryptUserData(employee._id.toString());
      const encryptedCompanyId = encryptUserData(employee.companyId.toString());
      const oneYearInSeconds = 365 * 24 * 60 * 60;
      const AccessData = {
          companyName:EmployeeComData.companyName,
          companyLogo:EmployeeComData.companyLogo,
          employeeId: employee._id,
          employeeName: employee.YemplyeeName,
          employeeRoal: employee.EmplyeeRoal,
          employeeProfile: employee.EmplyeeProfile,
          isVerify: EmployeeComData.isVerify,
      }
      return res
        .status(200)
        .cookie("employeeId", encryptedId, {

                            httpOnly: true,
                            secure:true,
                            sameSite: "none", 
                            maxAge: oneYearInSeconds * 1000 // Convert seconds to milliseconds
        })
        .cookie("companyId", encryptedCompanyId, {
                            httpOnly: true,
                            secure:true,
                            sameSite: "none", 
                            maxAge: oneYearInSeconds * 1000 // Convert seconds to milliseconds
        })
        .json({
          message: "Employee login successful!",
          AccessData
        });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Something went wrong" });
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
                            secure:true,
                            sameSite: "none", 
                            maxAge: oneYearInSeconds * 1000 // Convert seconds to milliseconds
                            })
                            .cookie("accessRule", user.accessRule, {
                            httpOnly: true,
                            secure:true,
                            sameSite: "none", 
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
router.get("/logout", (req, res) => {
  try {
    // Clear both cookies separately
    res.clearCookie("companyId", { path: "/" });
    res.clearCookie("employeeId", { path: "/" });

    return res.status(200).json({ message: "You are logged out!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
});
//user logout </>

//user profile data get <>
router.get("/userProfileData",async(req,res) => {
    const {companyId} = req.cookies;
    const DecreptedCompanyId = decryptUserData(companyId);
    try{
        const userData = await Companies.findById(DecreptedCompanyId).select("fullname email isVerify gender phone");
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
//         const userData = await Companies.findById(companyId);
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