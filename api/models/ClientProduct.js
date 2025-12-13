import { Schema, model } from "mongoose";

const ClientProductData = new Schema(
    {
        companyId: { type: Schema.Types.ObjectId, ref: "Companies", required: true },
        ProductName:{type: String,required: true},
        productImgFile: {type: String},
        CloudinaryPublicId: {type:String},
        InStockQuentity: {type: Number},
        ProductPrice:{type: Number,required: true},
        GoalIdentifire:{type:[],required:true}
    },
    { timestamps: true}
);
export default model("ClientProduct", ClientProductData, "ClientProduct");