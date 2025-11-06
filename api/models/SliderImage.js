import {Schema, model} from 'mongoose'

const SliderImages = new Schema(
    {
        SliderBackgroud: {type: Object,required: true},
        SliderForeground: {type:Object,required:true},
        SliderHeading: {type:String,required:true},
        SliderDescription: {type:String,required:true},
        sliderPreviousPrice: {type:Number,required:true},
        sliderCurrentPrice: {type:Number,required:true},
        productId: {type:String,required:true},
    },
    {timestamps:true}
);

export default model("SliderImages", SliderImages, "SliderImages");