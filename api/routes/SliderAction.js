import express from 'express';
const router = express.Router();
import SliderImages from "../models/SliderImage.js";
import { uploadImage } from '../cloudinary.js';
import { deleteResorce } from '../cloudinaryDelete.js';
import multerMultpleSameField from '../multerMSameField.js';


//get all slider <>
router.get("/getSliderData", async(req,res) => {
    try{
        const getData = await SliderImages.find();
        if(getData){
            res.status(200).json({data:getData});
        }else{
            res.status(201).json({message:"Data not found"});
        }
    }catch(error){
        console.log(error);
        return res.status(201).json({message:"Failed to finding data!"});
    }
});
//get all slider </>

// brand name and logo start
router.post("/sliderData/:fname", async(req,res) => {
    let fname = req.params.fname;
    multerMultpleSameField(req, res, async (err) => {
        if (err) {
            return res.json({message:err.message});
        }
        try {
            const files = req.files;
            const {SliderHeading,SliderDescription,sliderPreviousPrice, sliderCurrentPrice,productId} = req.body;

            if (!files) {
                return res.status(201).json({message:"No files uploaded!"});
            }else if(SliderHeading === "" || SliderDescription === "" || sliderPreviousPrice === "" || 
            sliderCurrentPrice === "" || productId === ""){
                res.status(201).json({message:"Field must not be Empty!"})
            }else{
                const uploadResults = {};
                for (const fieldName in files) {
                    const file = files[fieldName][0];
                    const { buffer } = file;
                    const fileType = file.mimetype; // MIME type of the file
                    const imageName = new Date().getTime().toString();
                    const result = await uploadImage(buffer, imageName, fname, fileType);
                    uploadResults[fieldName] = {image:result.secure_url,publicId:result.public_id};
                }
                    const {SliderBackgroud, SliderForeground} = await uploadResults;
                    const uploadData = new SliderImages({SliderBackgroud,SliderForeground,
                        SliderHeading,SliderDescription,sliderPreviousPrice,sliderCurrentPrice,productId});        
                await uploadData.save();
                return res.status(200).json({
                    message: 'Slider Data Upload Successfully!',
                    data: uploadData,
                  });        
            }                
        }catch (error) {
            console.log(error);
            return res.status(201).json({message:"Failed to upload!"});
        }
    })
});
//slider data end </>
//delete slider<>
router.delete("/sliderDataDelete/:sliderid/:bgPublicurl/:fgPublicurl", async(req,res) => {
    const {sliderid,bgPublicurl,fgPublicurl} = req.params;
    try {
        await deleteResorce([bgPublicurl,fgPublicurl],'image');
        const deleteVideos = await SliderImages.findByIdAndDelete(sliderid);
          if(deleteVideos){
            res.status(200).json({ message: 'Slider deleted successfully' , data:deleteVideos});
          }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
      } 
    
});
//delete slider</>

export default router;