const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, default: "user", enum: ["user", "vendor", "admin"] }

}, { timestamps: true, strict: "throw" })

const UserModel = mongoose.models.user || mongoose.model('user', UserSchema)

module.exports = UserModel;