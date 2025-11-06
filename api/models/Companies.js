import { Schema, model } from "mongoose";
const EmplyeeSchima = new Schema({
    EmplyeeProfile:{type:String},
    CloudinaryPublicId:{type:String},
    YemplyeeName:{type:String},
    employeePosition:{type:String},
    YemplyeeEmail:{type:String},
    YemplyeePhone:{type:String},
    YemplyeeLeaving:{type:String},
    EmplyeeJoinDate:{type:String},
    EmplyeeRoal:{type:String},
    employeeAccessPassword:{type:String},
    currency:{type:String},
    EmplyeeSellary:{type:Number},
    FirstSelarry:{type:Number},
    lsatPaid:{type:String},
    savingsTotalMonth:{type:String},
    savingsPercentige:{type:String},
    TotalSeavings:{type:String},
    activeStatus:{type:Boolean, default:true},
    lastActive:{type:String},
    EmployeeProfileStatus: {
        type: String,
        enum: ["Suspended", "Warned", "Blocked", "Cancel"],
        default: "Suspended"
        }
},{timestamps:true});

const ClientProductData = new Schema(
    {
        ProductName:{type: String,required: true},
        productImgFile: {type: String},
        CloudinaryPublicId: {type:String},
        InStockQuentity: {type: Number},
        ProductPrice:{type: Number,required: true},
        GoalIdentifire:{type:[],required:true}
    },
    { timestamps: true}
);


const CompanySchema = new Schema(
    {
        companyEmail: {type:String,unique:true},
        companyPassword: {type:String},
        verifyCode:{type:Number},
        isVerify:{
            type:Boolean,
            default:false
        },
        companyName:{type:String},
        industry:{type:String},
        numberofEmployees:{type:String},
        allEmployees:{ type: [EmplyeeSchima], default: [] },
        CurrentProduct:{ type: [ClientProductData], default: [] },
    },
    {timestamps:true},
);

export default model("Companies", CompanySchema, "Companies");

