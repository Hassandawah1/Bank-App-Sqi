const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express()
dotenv.config();
const connectDB = require('./database/connectDB');

const userRouter = require("./routers/user.controller");
app.use("/api/v1", userRouter);


mongoose.connect(process.env.DB_URI)
.then(() => {
    console.log("Db connected successfully");
})
.catch((err) => {
    console.log("cannot connect to db", err);
})



let PORT = process.env.PORT
app.listen(PORT, (err) => {
    if(err) {
        console.log("cannot start server", err);
    }else{
        console.log(`Server is running on port ${PORT}`);
    }
});


module.exports=async(res, req)=>{
    await connectDB()

    return app(req, res)
}