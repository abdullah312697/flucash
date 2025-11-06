import express from 'express';
const router = express.Router();
import { uploadImage } from '../cloudinary.js';
import multerProcess from '../multerMiddleware.js';
import Companies from "../models/Companies.js";
import{decryptUserData} from '../verifyuser.js';
import { deleteResorce } from '../cloudinaryDelete.js';

router.put("/addemplyee", async(req,res) => {
  const {userId} = req.cookies;
  const DecId = decryptUserData(userId);
  multerProcess(req, res, async (err) => {
      if (err) {
          return res.json({message:err.message});
    }
    try{
const fname = "EmplyeeProfile";
const files = req.file;
const Empye_Data = req.body;

const requiredFields = ['YemplyeeName', 'YemplyeePhone', 'YemplyeeEmail', 'YemplyeeLeaving', 'EmplyeeSellary','EmplyeeRoal','EmplyeeJoinDate'];
for (const field of requiredFields) {
  const value = Empye_Data[field];
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return res.status(400).json({ message: `Field "${field}" must not be empty` });
  }
}
  const imageStream = req.file.buffer;
  const fileType = files.mimetype; // MIME type of the file
  const imageName = new Date().getTime().toString();
  const uploadResult = await uploadImage(imageStream, imageName, fname, fileType);
const EmplyeeData = {...Empye_Data,EmplyeeProfile:uploadResult.secure_url,CloudinaryPublicId:uploadResult.public_id};

if(userId !== undefined){
  const updatedData = await Companies.findByIdAndUpdate(
  DecId,
  { $push: { allEmployees: EmplyeeData } },
  { new: true, projection: { allEmployees: { $slice: -1 } } }
  );
  const newEmployee = updatedData.allEmployees[0];
    return res.status(200).json({message:"New Emplyeed Added!",data:newEmployee});
}
  return res.status(400).json({message:"Login/Register please!"});
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Something went wrong"});
    }
  })
});

router.get("/getallEmployee", async(req,res) => {
  try{
  const {userId} = req.cookies;
  const DecId = decryptUserData(userId);
  if(userId !== undefined){
  const updatedData = await Companies.findById(DecId).select("allEmployees");
    if(!updatedData){
              return res.status(404).json({message:"data not found!"});
    };
    return res.status(200).json({data:updatedData.allEmployees});
  }
  return res.status(400).json({message:"Login/Register please!"});
  }catch(error){
    console.log(error);
    return res.status(500).json({message:"Something went wrong!"});
  }
});

router.get("/getSingleEmployee/:EmployeeId", async(req,res) => {
  try{
    const {EmployeeId} = req.params;
    const {userId} = req.cookies;
    const DecId = decryptUserData(userId);
    const company = await Companies.findOne(
      { _id: DecId, "allEmployees._id": EmployeeId },
      { "allEmployees.$": 1 }
    );

    if (!company || !company.allEmployees.length) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ employee: company.allEmployees[0] });
  }catch(error){
    console.log(error);
    return res.status(500).json({message:"Something went wrong!"});
  }
});

router.put("/updateEmployee/:EmployeeId", async(req,res) => {
  try{
      const {EmployeeId} = req.params;
      const {userId} = req.cookies;
      const DecId = decryptUserData(userId);
      const filterObject = Object.fromEntries(
        Object.entries(req.body).filter(([__, v]) => v !== "" && v !== null && v !== undefined)
      )
const upd = await Companies.updateOne(
      { _id: DecId, "allEmployees._id": EmployeeId },
      {
        $set: Object.fromEntries(
          Object.entries(filterObject).map(([k, v]) => [`allEmployees.$.${k}`, v])
        ),
      }
    );
    if (upd.matchedCount === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const doc = await Companies.findOne(
      { _id: DecId },
      {
        _id: 0,
        allEmployees: { $elemMatch: { _id: EmployeeId } },
      }
    );

    const updatedEmployee = doc?.allEmployees?.[0];
    return res.status(200).json({ message: "Update successful!", data: updatedEmployee });

  }catch(error){
    console.log(error);
    return res.status(500).json({message:"Something went wrong!"});
  }
});


router.put("/ChangeProfile/:EmployeeId", async(req,res) => {
  const {EmployeeId} = req.params;
  const {userId} = req.cookies;
  const DecId = decryptUserData(userId);
  multerProcess(req, res, async (err) => {
      if (err) {
          return res.json({message:err.message});
    }
  try{
  const fname = "EmplyeeProfile";
  const files = req.file;
  const oldPublicId = req.body.CloudinaryPublicId || null;
  const imageStream = req.file.buffer;
  const fileType = files.mimetype;
  const imageName = new Date().getTime().toString();
  const uploadResult = await uploadImage(imageStream, imageName, fname, fileType);

  const upd = await Companies.updateOne(
        { _id: DecId, "allEmployees._id": EmployeeId },
        {
          $set: {
            "allEmployees.$.EmplyeeProfile": uploadResult.secure_url,
            "allEmployees.$.CloudinaryPublicId": uploadResult.public_id,
          },
        }
      );

      if (upd.matchedCount === 0) {
        await deleteResorce(uploadResult.public_id, "image").catch(() => {});
        return res.status(404).json({ message: "Employee not found" });
      }

      if (oldPublicId) await deleteResorce(oldPublicId, "image").catch(() => {});

      const doc = await Companies.findOne(
        { _id: DecId },
        { _id: 0, allEmployees: { $elemMatch: { _id: EmployeeId } } }
      );
      const updatedEmployee = doc?.allEmployees?.[0] || null;

      return res.status(200).json({ message: "Update successful!", data: updatedEmployee });

}catch(err){
        console.log(err);
        return res.status(500).json({message:"Something went wrong"});
    }
  })
});

router.put("/updateEmployeePassword/:EmployeeId", async(req,res) => {
  const {EmployeeId} = req.params;
  const {userId} = req.cookies;
  const DecId = decryptUserData(userId);
  try{
  const EmployeePass = req.body.employeeAccessPassword;
  if(EmployeePass === "" || EmployeePass === null || EmployeePass === undefined){
    return res.status(400).json({ message: "Must not be empty!" });
  }
  const upd = await Companies.updateOne(
        { _id: DecId, "allEmployees._id": EmployeeId },
        {
          $set: {
            "allEmployees.$.employeeAccessPassword":EmployeePass
          },
        }
      );

      if (upd.matchedCount === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const doc = await Companies.findOne(
        { _id: DecId },
        { _id: 0, allEmployees: { $elemMatch: { _id: EmployeeId } } }
      );
      const updatedEmployee = doc?.allEmployees?.[0] || null;

      return res.status(200).json({ message: "Update successful!", data: updatedEmployee?.employeeAccessPassword });

}catch(err){
        console.log(err);
        return res.status(500).json({message:"Something went wrong"});
    }
});

router.put("/updateEmployeeStatus/:EmployeeId", async (req, res) => {
  const { EmployeeId } = req.params;
  const { userId } = req.cookies;
  const DecId = decryptUserData(userId);

  try {
    const EmployeeStatuss = req.body.EmployeeProfileStatus;

    const upd = await Companies.updateOne(
      { _id: DecId, "allEmployees._id": EmployeeId },
      { $set: { "allEmployees.$.EmployeeProfileStatus": EmployeeStatuss } },
       { runValidators: true }
    );

    if (upd.matchedCount === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const doc = await Companies.findOne(
      { _id: DecId },
      { "allEmployees": { $elemMatch: { _id: EmployeeId } } }
    );

    const updatedEmployee = doc?.allEmployees?.[0];

    return res.status(200).json({
      message: "Update successful!",
      data: updatedEmployee?.EmployeeProfileStatus,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.delete("/deleteEmployee/:EmployeeId", async (req, res) => {
  const { EmployeeId } = req.params;
  const { userId } = req.cookies;
  const DecId = decryptUserData(userId);

  try {
    // Pull (remove) the matching employee from the array
    const result = await Companies.updateOne(
      { _id: DecId },
      { $pull: { allEmployees: { _id: EmployeeId } } }
    );

    // If no employee was found or removed
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Employee not found or already deleted" });
    }

    return res.status(200).json({ message: "Employee deleted successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});


export default router;