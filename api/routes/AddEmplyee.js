import express from 'express';
const router = express.Router();
import { uploadImage } from '../cloudinary.js';
import multerProcess from '../multerMiddleware.js';
import Employee from "../models/Employee.js";
import{decryptCompanyPassword, decryptUserData, encryptCompanyPassword} from '../verifyuser.js';
import { deleteResorce } from '../cloudinaryDelete.js';
import Companies from "../models/Companies.js";

router.post("/addemplyee", async (req, res) => {
  const { companyId } = req.cookies;

  // Step 1: Validate company login
  if (!companyId) {
    return res.status(400).json({ message: "Login/Register please!" });
  }

  const companyIdDecrypted = decryptUserData(companyId);
  if (!companyIdDecrypted) {
    return res.status(400).json({ message: "Invalid company session!" });
  }

  // Step 2: Handle multer upload
  multerProcess(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    try {
      // Step 3: Validate required fields
      const requiredFields = [
        "YemplyeeName",
        "YemplyeePhone",
        "YemplyeeEmail",
        "YemplyeeLeaving",
        "EmplyeeSellary",
        "EmplyeeRoal",
        "EmplyeeJoinDate",
      ];
      const file = req.files;

      for (const field of requiredFields) {
        if (!req.body[field] || req.body[field].trim() === "") {
          return res.status(400).json({ message: `Field "${field}" must not be empty` });
        }
      }

      // Step 4: Validate profile image
      if (file.length === 0) {
        return res.status(400).json({ message: "Profile picture must be included!" });
      }

      // Step 5: Check duplicate email
      const exists = await Employee.findOne({ YemplyeeEmail: req.body.YemplyeeEmail });
      if (exists) {
        return res.status(409).json({ message: "Employee email already exists!" });
      }

      // Step 6: Upload image to cloud
      const newfile = file[0];
      const uploadResult = await uploadImage(
        newfile.buffer,
        Date.now().toString(),
        "EmplyeeProfile",
        newfile.mimetype
      );

    const EmployeePass = encryptCompanyPassword(req.body.employeeAccessPassword);


      const newEmployee = await Employee.create({
        ...req.body,
        companyId: companyIdDecrypted,
        EmplyeeProfile: uploadResult.secure_url,
        CloudinaryPublicId: uploadResult.public_id,
        employeeAccessPassword: EmployeePass,
      });

      return res.status(200).json({
        message: "New employee added!",
        data: newEmployee,
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Something went wrong" });
    }
  });
});


router.get("/getallEmployee", async (req, res) => {
  try {
    const { companyId } = req.cookies;
    const companyIdDecripted = decryptUserData(companyId); // this should be the companyIdDecripted

    if (!companyIdDecripted) {
      return res.status(400).json({ message: "Login/Register please!" });
    }

    // Find all employees for this company
    const employees = await Employee.find({ companyId: companyIdDecripted }, "-employeeAccessPassword");

    if (!employees || employees.length === 0) {
      return res.status(404).json({ message: "No employees found!" });
    }

    return res.status(200).json({ data: employees });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
});

router.get("/getallEmployeeforMessage", async (req, res) => {
  try {
    const { companyId } = req.cookies;
    const companyIdDecripted = decryptUserData(companyId); // this should be the companyIdDecripted

    if (!companyIdDecripted) {
      return res.status(400).json({ message: "Login/Register please!" });
    }

    // Find all employees for this company
    const employees = await Employee.find({ companyId: companyIdDecripted }).select("EmplyeeProfile YemplyeeName");

    if (!employees || employees.length === 0) {
      return res.status(404).json({ message: "No employees found!" });
    }

    return res.status(200).json({ data: employees });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
});

router.get("/getSingleEmployee/:EmployeeId", async (req, res) => {
  try {
    const { EmployeeId } = req.params;
    const { companyId } = req.cookies;
    const companyIdDecripted = decryptUserData(companyId); // Company ID

    if (!companyIdDecripted) {
      return res.status(400).json({ message: "Login/Register please!" });
    }
    const employee = await Employee.findOne({ _id: EmployeeId, companyId: companyIdDecripted });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const decUserPassword = decryptCompanyPassword(employee?.employeeAccessPassword);
    employee.employeeAccessPassword = decUserPassword;
    res.status(200).json({ employee });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
});

router.put("/updateEmployee/:EmployeeId", async (req, res) => {
  try {
    const { EmployeeId } = req.params;
    const { companyId } = req.cookies;
    const companyIdDecripted = decryptUserData(companyId); // Company ID

    if (!EmployeeId || !companyId) {
      return res.status(400).json({ message: "Login/Register please!" });
    }

    // Filter out empty/null/undefined fields
    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
    );

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update!" });
    }

    const { YemplyeeEmail, ...filteredData } = updateData;
    // Update the employee document directly
    const updatedEmployee = await Employee.findOneAndUpdate(
      { _id: EmployeeId, companyId: companyIdDecripted }, // Ensure employee belongs to this company
      { $set: filteredData },
      { new: true } // Return the updated document
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    const company = await Companies.findById(companyIdDecripted).select("-companyPassword");
    
      const AccessData = {
      companyName: company.companyName,
      companyLogo: company.companyLogo,
      employeeName: updatedEmployee.YemplyeeName,
      employeeRoal: updatedEmployee.EmplyeeRoal,
      employeeProfile: updatedEmployee.EmplyeeProfile,
      isVerify: company.isVerify,
    };

    return res.status(200).json({
      message: "Update successful!",
      data: updatedEmployee,
      AccessData
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
});


router.put("/ChangeProfile/:EmployeeId", async (req, res) => {
  const { EmployeeId } = req.params;
  const { companyId } = req.cookies;
  const companyIdDecripted = decryptUserData(companyId); // Company ID

  if (!companyIdDecripted) {
    return res.status(400).json({ message: "Login/Register please!" });
  }

  multerProcess(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
      const file = req.files;

    try {
            const newFile = file[0];

      if (file.length === 0) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const oldPublicId = req.body.CloudinaryPublicId || null;

      // Upload new profile image
      const imageName = new Date().getTime().toString();
      const uploadResult = await uploadImage(newFile.buffer, imageName, "EmplyeeProfile", newFile.mimetype);

      // Update Employee document
      const updatedEmployee = await Employee.findOneAndUpdate(
        { _id: EmployeeId, companyId: companyIdDecripted }, // Ensure employee belongs to this company
        {
          $set: {
            EmplyeeProfile: uploadResult.secure_url,
            CloudinaryPublicId: uploadResult.public_id,
          },
        },
        { new: true } // Return updated document
      );

      if (!updatedEmployee) {
        // Delete newly uploaded image if update failed
        await deleteResorce(uploadResult.public_id, "image").catch(() => {});
        return res.status(404).json({ message: "Employee not found" });
      }

      // Delete old profile image from Cloudinary
      if (oldPublicId) await deleteResorce(oldPublicId, "image").catch(() => {});
      const company = await Companies.findById(companyIdDecripted).select("-companyPassword");
    
        const AccessData = {
        companyName: company.companyName,
        companyLogo: company.companyLogo,
        employeeName: updatedEmployee.YemplyeeName,
        employeeRoal: updatedEmployee.EmplyeeRoal,
        employeeProfile: updatedEmployee.EmplyeeProfile,
        isVerify: company.isVerify,
      };

      return res.status(200).json({
        message: "Profile updated successfully!",
        data: updatedEmployee,
        AccessData
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Something went wrong!" });
    }
  });
});

router.put("/updateEmployeePassword/:EmployeeId", async (req, res) => {
  try {
    const { EmployeeId } = req.params;
    const { companyId } = req.cookies;
    const companyIdDecripted = decryptUserData(companyId); // Company ID

    if (!companyIdDecripted) {
      return res.status(400).json({ message: "Login/Register please!" });
    }
    const checkEpass = req.body.employeeAccessPassword;

    if (!checkEpass || checkEpass.trim() === "") {
      return res.status(400).json({ message: "Password must not be empty!" });
    }

    const EmployeePass = encryptCompanyPassword(checkEpass);

    const updatedEmployee = await Employee.findOneAndUpdate(
      { _id: EmployeeId, companyId: companyIdDecripted }, // Ensure employee belongs to this company
      { $set: {employeeAccessPassword: EmployeePass } },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      message: "Password updated successfully!",
      data: decryptCompanyPassword(updatedEmployee?.employeeAccessPassword),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong!" });
  }
});

router.put("/updateEmployeeStatus/:EmployeeId", async (req, res) => {
  try {
    const { EmployeeId } = req.params;
    const { companyId } = req.cookies;
    const companyIdDecripted = decryptUserData(companyId); // Company ID

    if (!companyIdDecripted) {
      return res.status(400).json({ message: "Login/Register please!" });
    }

    const EmployeeStatus = req.body.EmployeeProfileStatus;

    if (!EmployeeStatus) {
      return res.status(400).json({ message: "Employee status is required!" });
    }

    // Update employee status directly
    const updatedEmployee = await Employee.findOneAndUpdate(
      { _id: EmployeeId, companyId: companyIdDecripted }, // Ensure employee belongs to this company
      { $set: { EmployeeProfileStatus: EmployeeStatus } },
      { new: true, runValidators: true } // Return updated document & validate enum
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      message: "Update successful!",
      data: updatedEmployee.EmployeeProfileStatus,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.delete("/deleteEmployee/:EmployeeId", async (req, res) => {
  try {
    const { EmployeeId } = req.params;
    const { companyId } = req.cookies;
    const companyIdDecripted = decryptUserData(companyId); // Company ID

    if (!companyIdDecripted) {
      return res.status(400).json({ message: "Login/Register please!" });
    }

    // Delete the employee directly
    const deletedEmployee = await Employee.findOneAndDelete({
      _id: EmployeeId,
      companyId: companyIdDecripted, // Ensure employee belongs to this company
    });

    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found or already deleted" });
    }

    return res.status(200).json({ message: "Employee deleted successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});


export default router;