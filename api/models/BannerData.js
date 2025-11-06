import { Schema, model } from "mongoose";


const BannerData = new Schema(
    {
        BannerHeading: {type: String},
        ProductCurrentPrice: {type: Number},
        ProductPreviousPrice: {type: Number},
        ProductId: {type: String},
        isActive: {type:Boolean,default:true},
        campaignEndDate: {type:String},
        Style: {type:String},
    },
    { timestamps: true}
);

export default model("BannerData", BannerData, "BannerData")
