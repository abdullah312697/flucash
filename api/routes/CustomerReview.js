import express from 'express';
const router = express.Router();
import { uploadImage } from '../cloudinary.js';
import multerMultipleReviews from '../multermultiple.js';
import Review from '../models/Reviews.js';

// brand name and logo start
router.post("/customerReview/:productId/:fname", async(req,res) => {
    const {productId,fname} = req.params;
    multerMultipleReviews(req, res, async (err) => {
        if (err) {
            return res.json({message:err.message});
        }
        try {
            const files = req.files;
            const {comments,ratingPoints,ratingText,customerId,customerName,customerGender} = req.body;
            if (!files) {
                return res.status(201).json({message:"No files uploaded!"});
            }else if(comments === "" || ratingPoints === "" || ratingText === ""){
                res.status(201).json({message:"Field must not be Empty!"})
            }else{
                let imageLink = [];
                for (const fieldName in files) {
                    const file = files[fieldName];
                    const { buffer } = file;
                    const fileType = file.mimetype; // MIME type of the file
                    const imageName = new Date().getTime().toString();
                    const result = await uploadImage(buffer, imageName, fname, fileType);
                    imageLink.push({image:result.secure_url,publicId:result.public_id});
                }
                const uploadData = new Review({productId,imageLink,comments,customerName,customerId,customerGender,ratingPoints,ratingText});        
                const savedData = await uploadData.save();
                if(savedData){
                    res.status(200).json({
                        message: 'Thanks for reviewing!',
                        data: uploadData,
                      })
                }
            }                
        }catch (error) {
            console.log(error);
            return res.status(201).json({message:"Failed to upload!"});
        }
    })
});
//slider data end </>
//get all customer review<>
router.get("/getAllRevies/:productId", async(req,res) => {
    const {productId} = req.params;
    try{
        const data = await Review.find({productId:productId}).sort({ createdAt: -1 });
        if(data){
            res.status(200).json(data);
        }else{
            res.status(201).json("data not found");
        }
    }catch(error){
        console.log(error);
        return res.status(201).json({message:"Failed to get Product!"});
    }
})
//get all customer review</>
export default router;