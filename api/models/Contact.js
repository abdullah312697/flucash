import mongoose from "mongoose";

const CustomerContact = new mongoose.Schema({
    fullname:{type:String},
    email:{type:String},
    phone:{type:String},
    comment:{type:String},
    replay:{type:String},
    isRead:{type:Boolean,default:false}
},{timestamps:true});

const Contact = mongoose.model("Contact",CustomerContact,"Contact");

export default Contact;