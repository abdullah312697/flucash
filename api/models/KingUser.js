import { Schema, model } from "mongoose";

const KingUserScema = new Schema(
    {
        king_email: {type:String,unique:true},
        king_pass: {type:String},
        accessRule: {
            type: String,
            enum: ['All', 'Editor', 'Author','Order','Delivery'],
            default: 'All'
          },
    },
    {timestamps:true},
);

export default model("kingAdmin", KingUserScema, "king_admin");

