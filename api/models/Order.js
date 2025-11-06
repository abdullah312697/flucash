import mongoose from "mongoose";

const newOrder = new mongoose.Schema({
    productId: {type:String},
    productName:{type:String},
    customerId:{type:String},
    totalQuentity: {type:Number},
    productPrice: {type:Number},
    totalPrice: {type:Number},
    Discount: {type:Number},
    grandTotal: {type:Number},
    colorOfQuentity: {type:Array},
    areaName:{type:String},
    block:{type:String},
    gidda:{type:String},
    street:{type:String},
    houseNo:{type:String},
    floorNo:{type:String},
    appartment:{type:String},
    fullname:{type:String},
    mobilenumber:{type:String},
    email:{type:String},
    preferredTime:{type:String},
    orderStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'UnderDelivery','Completed', 'Cancelled', 'Returned'],
        default: 'Pending'
      },
    FeedBack:{type:String},
    // paymentMethod: { type: String, enum: ['PayPal', 'Cash on Delivery'], required: true },
    // payerID: { type: String },
    // paymentID: { type: String },
    // paymentStatus: { type: String }
    },{ timestamps: true });

const CustomerOrders = mongoose.model('CustomerOrders', newOrder, 'CustomerOrders');
export default CustomerOrders;