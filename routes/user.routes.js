const express = require("express")
const { registerUser,  loginUser, getUsers, verifyUser, registerVendor } = require("../controllers/user.controller")
const router= express.Router()


router.post("/register", registerUser)
router.post("/vendor/register", registerVendor)
router.get("/getusers",verifyUser, getUsers)
router.post("/login", loginUser)


module.exports=router