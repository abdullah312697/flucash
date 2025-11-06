import express from 'express';
const router = express.Router();
import BannerData from "../models/BannerData.js";


//get all slider <>
router.get("/getBannerData/", async(req,res) => {
    try{
        const getData = await BannerData.findById("6693a19bc97b0af3f476c501");
        if(getData){
            res.status(200).json(getData);
        }else{
            res.status(201).json("data not faund!");
        }
    }catch(error){
        console.log(error);
        return res.status(201).json("Failed to finding data!");
    }
});
//get all slider </>
//update Campaign <>
router.put("/updateCampaign/", async(req,res) => {
    try{
        const updatedData = req.body;
        const hasChanges = Object.entries(updatedData).some(
            ([key, value]) =>  value === ""
          );
        if(hasChanges){
            res.status(400).json("filed must not be empty");
        };
        const getData = await BannerData.findByIdAndUpdate("6693a19bc97b0af3f476c501",{ $set: updatedData},{new:true});
        if(getData){
            res.status(200).json({message:"data update successfully!", data:getData});
        }else{
            res.status(201).json("data not faund for update!");
        }
    }catch(error){
        console.log(error);
        return res.status(201).json("Failed to upload data!");
    }
});
//update Campaign </>

export default router;