import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    productId:String,
    imageLink: [{image:{type:String},publicId:{type:String}}],
    comments: String,
    customerName:String,
    customerId:String,
    customerGender:String,
    ratingPoints: Number,
    ratingText: String,
},{ timestamps: true });

const Review = mongoose.model('Review', reviewSchema, 'CustomerReview');
export default Review;