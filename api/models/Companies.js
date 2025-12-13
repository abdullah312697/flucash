import { Schema, model } from "mongoose";

const CompanySchema = new Schema(
    {
        companyEmail: {type:String,unique:true},
        companyPassword: {type:String},
        companyLogo:{type:String},
        CloudinaryPublicId:{type:String},
        verifyCode:{type:Number},
        isVerify:{
            type:Boolean,
            default:false
        },
        companyName:{type:String},
        industry:{type:String},
        numberofEmployees:{type:String},
    },
    {timestamps:true},
);

export default model("Companies", CompanySchema, "Companies");

