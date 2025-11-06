import express, { json } from "express";
const app = express();
import { set, connect } from "mongoose";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
config();
import productData from './routes/deshbord.js'; 
import userRouter from  './routes/UserProcess.js';
import sliderAction from "./routes/SliderAction.js";
import CustomerReview from './routes/CustomerReview.js'
import ContactTo from './routes/ContactTo.js'
import AddOrder from './routes/AddOrder.js'
import Facebook from './routes/Facebook.js'
import Banner from './routes/Banner.js'
import Setmytarget from './routes/Setmytarget.js'
import AddEmplyee from './routes/AddEmplyee.js'
import ClientAddProduct from './routes/ClientAddProduct.js'

const allowedOrigins = [
    'http://nothun.com',
    'https://nothun.com',
    'http://www.nothun.com',
    'https://www.nothun.com',
    'http://167.172.88.139',
    'https://167.172.88.139',
    'https://167.172.88.139:3000',
    'http://localhost:3000', // Local development
    'http://192.168.8.101:3000'// Local development
];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // Allow non-browser requests like mobile apps
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials : true
}));

const mongoDB = process.env.MONGO_URL;
set('strictQuery', false);
connect(mongoDB).then(() => {
    console.log("databse connection successfully");
}).catch((err) => {
    console.log(err);
});


app.use(cookieParser());
app.use(json());
app.use("/api/users",userRouter);
app.use("/api/addproduct",productData);
app.use("/api/slider",sliderAction);
app.use("/api/review",CustomerReview);
app.use("/api/order",AddOrder);
app.use("/api/contact",ContactTo);
app.use("/api/facebook",Facebook);
app.use("/api/banner",Banner);
app.use("/api/setgole",Setmytarget);
app.use("/api/newemplyee",AddEmplyee);
app.use("/api/newproduct",ClientAddProduct);
app.listen(process.env.PORT || 5000, () => {
    console.log(`app is running on port http://localhost:5000`); 
});