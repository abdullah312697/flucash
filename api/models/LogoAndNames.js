import {Schema, model} from 'mongoose'

const LogoAndNames = new Schema(
    {
        brandName: {type: String},
        barndLogo: {type:String},
        CloudinaryPublicId: {type:String},
    },
    {timestamps:true}
);

export default model("LogoAndNames", LogoAndNames, "LogoAndName");