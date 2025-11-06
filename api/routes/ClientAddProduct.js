import express from 'express';
const router = express.Router();
import { uploadImage } from '../cloudinary.js';
import multerProcess from '../multerMiddleware.js';
import Companies from "../models/Companies.js";
import{decryptUserData} from '../verifyuser.js';
import { deleteResorce } from '../cloudinaryDelete.js';

router.put("/addNewProduct", async(req,res) => {
  const {userId} = req.cookies;
  const DecId = decryptUserData(userId);
  multerProcess(req, res, async (err) => {
      if (err) {
          return res.json({message:err.message});
    }
    try{
const fname = "ProductImage";
const files = req.file;
const Empye_Data = req.body;
const requiredFields = ['ProductName', 'ProductPrice', 'InStockQuentity'];
for (const field of requiredFields) {
  const value = Empye_Data[field];
  if (!value || value === '' ) {
    return res.status(400).json({ message: `Field "${field}" must not be empty` });
  }
}
  const imageStream = req.file.buffer;
  const fileType = files.mimetype; // MIME type of the file
  const imageName = new Date().getTime().toString();
  const uploadResult = await uploadImage(imageStream, imageName, fname, fileType);
  const ProductData = {...Empye_Data,productImgFile:uploadResult.secure_url,CloudinaryPublicId:uploadResult.public_id};

if(userId !== undefined){
  const updatedData = await Companies.findByIdAndUpdate(
  DecId,
  { $push: { CurrentProduct: ProductData } },
  { new: true, projection: { CurrentProduct: { $slice: -1 } } }
  );
  const newProduct = updatedData.CurrentProduct[0];
    return res.status(200).json({message:"New Product Added!",data:newProduct});
}
  return res.status(400).json({message:"Login/Register please!"});
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Something went wrong"});
    }
  })
});

router.get("/getallProducts", async(req,res) => {
  try{
  const {userId} = req.cookies;
  const DecId = decryptUserData(userId);
  if(userId !== undefined){
  const updatedData = await Companies.findById(DecId).select("CurrentProduct");
    if(!updatedData){
              return res.status(404).json({message:"data not found!"});
    };
    return res.status(200).json({data:updatedData.CurrentProduct});
  }
  return res.status(400).json({message:"Login/Register please!"});
  }catch(error){
    console.log(error);
    return res.status(500).json({message:"Something went wrong!"});
  }
});

router.get("/getSingleProduct/:ProductId", async(req,res) => {
  try{
    const {ProductId} = req.params;
    const {userId} = req.cookies;
    const DecId = decryptUserData(userId);
    const company = await Companies.findOne(
      { _id: DecId, "CurrentProduct._id": ProductId },
      { "CurrentProduct.$": 1 }
    );

    if (!company || !company.CurrentProduct.length) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ product: company.CurrentProduct[0] });
  }catch(error){
    console.log(error);
    return res.status(500).json({message:"Something went wrong!"});
  }
});


// PUT /updateProduct/:productId
router.put("/updateProduct/:productId", async (req, res) => {
  const { userId } = req.cookies;
  if (!userId) return res.status(401).json({ message: "Login/Register please!" });

  const DecId = decryptUserData(userId);
  const productId = req.params.productId;

  multerProcess(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    try {
      // 1) Build a filtered update object from req.body (remove '', null, undefined)
      const rawData = req.body || {};
      const filtered = {};
      for (const key of Object.keys(rawData)) {
        const val = rawData[key];
        // treat string-only empties and explicit null/undefined as "remove"
        if (val !== "" && val !== null && val !== undefined) {
          filtered[key] = val;
        }
      }

      // 2) If an image file was uploaded, upload to Cloudinary and attach fields
      if (req.file && req.file.buffer) {
        const fname = "ProductImage";
        const imageStream = req.file.buffer;
        const fileType = req.file.mimetype;
        const imageName = Date.now().toString();

        // uploadImage should return { secure_url, public_id } like in add route
        const uploadResult = await uploadImage(imageStream, imageName, fname, fileType);
        if (!uploadResult || !uploadResult.secure_url) {
          return res.status(500).json({ message: "Image upload failed" });
        }
        filtered.productImgFile = uploadResult.secure_url;
        filtered.CloudinaryPublicId = uploadResult.public_id;
      }

      // 3) Find company and the specific product inside CurrentProduct
      const company = await Companies.findById(DecId);
      if (!company) return res.status(404).json({ message: "Company not found" });

      const productIndex = company.CurrentProduct.findIndex(p => String(p._id) === String(productId));
      if (productIndex === -1) return res.status(404).json({ message: "Product not found" });

      const existingProduct = company.CurrentProduct[productIndex].toObject ? company.CurrentProduct[productIndex].toObject() : company.CurrentProduct[productIndex];

      // 4) If a new CloudinaryPublicId was uploaded and existing product had a public id, delete the old image
      if (filtered.CloudinaryPublicId && existingProduct.CloudinaryPublicId) {
        try {
          await deleteResorce(existingProduct.CloudinaryPublicId, "image").catch(() => {});
        } catch (delErr) {
          // log and continue — not fatal for the update
          console.warn("Failed to delete old Cloudinary image:", delErr);
        }
      }

      // 5) Merge existing product and filtered updates (replace only provided fields)
      const updatedProduct = { ...existingProduct, ...filtered, updatedAt: Date.now() };

      // replace the product element and save the company doc
      company.CurrentProduct[productIndex] = updatedProduct;
      await company.save();

      // return the updated product
      return res.status(200).json({ message: "Product updated", data: company.CurrentProduct[productIndex] });
    } catch (err) {
      console.error("updateProduct error:", err);
      return res.status(500).json({ message: "Something went wrong" });
    }
  });
});


router.put("/ChangePorductImage/:ProductId", async(req,res) => {
  const {ProductId} = req.params;
  const {userId} = req.cookies;
  const DecId = decryptUserData(userId);
  multerProcess(req, res, async (err) => {
      if (err) {
          return res.json({message:err.message});
    }
  try{
  const fname = "ProductImage";
  const files = req.file;
  const oldPublicId = req.body.CloudinaryPublicId || null;
  const imageStream = req.file.buffer;
  const fileType = files.mimetype;
  const imageName = new Date().getTime().toString();
  const uploadResult = await uploadImage(imageStream, imageName, fname, fileType);

  const upd = await Companies.updateOne(
        { _id: DecId, "CurrentProduct._id": EmployeeId },
        {
          $set: {
            "CurrentProduct.$.productImgFile": uploadResult.secure_url,
            "CurrentProduct.$.CloudinaryPublicId": uploadResult.public_id,
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
        { _id: 0, CurrentProduct: { $elemMatch: { _id: ProductId } } }
      );
      const updatedProduct = doc?.CurrentProduct?.[0] || null;

      return res.status(200).json({ message: "Update successful!", data: updatedProduct });

}catch(err){
        console.log(err);
        return res.status(500).json({message:"Something went wrong"});
    }
  })
});

router.delete("/deleteProduct/:ProductId", async (req, res) => {
  try {
    const { userId } = req.cookies;
    const DecId = decryptUserData(userId);
  const {ProductId} = req.params;
    if (!userId) {
      return res.status(401).json({ message: "Login/Register please!" });
    }

    // Validate product IDs
    if (!ProductId) {
      return res.status(400).json({ message: "No product IDs provided" });
    }

  const updatedCompany = await Companies.findByIdAndUpdate(
      DecId,
      { $pull: { CurrentProduct: { _id: ProductId } } },
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    return res.status(200).json({
      message: "Selected product(s) deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});


export default router;