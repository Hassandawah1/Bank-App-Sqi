const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    tag:{type: String, sparse: true, unique: true},
    password: {type: String, required: true, select: false},
    role: {type: String, required: true, enum: ["user", "admin", "operator"]},
    accountNumber: {type:String, sparse:true},
    profilePicture: {
        secure_url:{type:string},
        public_id:{type:string}
    }
}, {timestamps: true, strict: "throw"})


const UserModel = mongoose.model("User", UserSchema)

module.exports = UserModel