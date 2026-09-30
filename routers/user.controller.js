const express = require("express")
const { registerUser, getUsers, verifyUser, registerOperator, loginOperator, getUserProfile, loginUser, updateUser, resolveAccount } = require("../controllers/user.controller")

const router = express.Router()
router.get('/getUsers', verifyUser, getUsers)
router.get('/myDetails', verifyUser, getUserProfile)
router.post('/register', registerUser)
router.post('/registerOperator', registerOperator)
router.post('/loginOperator', loginOperator)
router.post('/loginUser', loginUser)
router.patch('/user/:id', updateUser)
router.get('/user/:accountNumber', verifyUser, resolveAccount)

module.exports = router