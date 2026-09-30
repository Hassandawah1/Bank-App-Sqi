require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const UserModel = require("../models/user.model")
const AccountModel = require("../models/account.model")
const app = express()
const nodemailer = require('nodemailer')
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_KEY,
    api_secret:process.env.CLOUD_SECRET
})



let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASS
    }
});


const registerUser = async (req, res) => {
    const { firstname, lastname, email, password, tag, photo } = req.body
    try {
        const saltround = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, saltround)
        const number = `${Math.ceil(Math.random() * 10000000)}`.padStart(7, "0")
        const generatedAccount = `AUG${number}`
        const image = await cloudinary.uploader.upload(photo, {resource_type:"image"})
        const user = await UserModel.create({ 
            firstname, 
            lastname, 
            email, 
            password: hashedPassword, 
            tag, 
            accountNumber: generatedAccount, 
            profilePicture:{
                secure_url:image.secure_url,
                profile_id:image.profile_id
            }
        });




        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "10m", algorithm: "HS256" })


        let mailOptions = {
            from: process.env.APP_EMAIL,
            to: 'myfriend@yahoo.com',
            subject: `Welcome to AugBank ${firstname}`,
            text: `Welcome to AugBank where transaction is made esy, this is your account number${user.accountNumber}`
        };


        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(201).send({
            message: "User created successfully",
            data: {
                firstname,
                lastname,
                email,
                tag: tag ? tag : null,
                accountNumber: generatedAccount,
                token,
                balance: user.balance,
                photo:user.profilePicture.secure_url
            }
        })
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).send({
                message: "Email or tag already exist"
            })
        } else {
            res.status(400).send({
                message: "User cannot be created at this time"
            })
        }
    }
}

const registerOperator = async (req, res) => {
    const { firstname, lastname, email, password } = req.body
    try {
        const saltround = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, saltround)

        const user = await UserModel.create({ firstname, lastname, email, password: hashedPassword, role: "operator" });
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "10m", algorithm: "HS256" })

        res.status(201).send({
            message: "Operator created successfully",
            data: {
                firstname,
                lastname,
                email,

                token
            }
        })
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).send({
                message: "Email or tag already exist"
            })
        } else {
            res.status(400).send({
                message: "Operator cannot be created at this time"
            })
        }
    }
}

const getUsers = async (req, res) => {
    const { id, role } = req.user
    try {
        if (role !== "admin" && role !== "operator") { //(role == "user"){}
            res.status(403).send({
                message: "not possible"
            })

            return;
        }
        const users = await UserModel.find()
        res.status(200).send({
            message: "all users fetched successfully",
            data: users,
        })

    } catch (err) {
        res.status(400).send({
            message: "cannot fetch users at this time"
        })

    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const isUser = await UserModel.findOne({ email }).select("+password")

        if (!isUser) {
            res.status(400).send({
                message: "account does not exist"
            })

            return;
        }

        const isMatch = await bcrypt.compare(password, isUser.password)

        if (!isMatch) {
            res.status(400).send({
                message: "invalid credentials"
            })

            return
        }

        const token = jwt.sign({ id: isUser._id, role: isUser.role }, process.env.JWT_SECRET, { expiresIn: "10m", algorithm: "HS256" })

        res.status(200).send({
            message: "login successful",
            data: {
                firstname: isUser.firstname,
                lastname: isUser.lastname,
                email: isUser.email,
                role: isUser.role,
                tag: isUser.tag,
                token,
                balance: user.balance
            }
        })
    } catch (err) {
        res.status(400).send({
            message: "invalid credentials"
        })
    }
}


const verifyUser = async (req, res, next) => {
    try {
        const token = req.headers["authorization"].split(" ")[1] ? req.headers["authorization"].split(" ")[1] : req.headers["authorization"].split(" ")[0];

        const user = await jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) {
                res.status(401).send({
                    message: "User unauthorized"
                })
                return;
            }

            req.user = decoded
            console.log(decoded);

            next()
        });
    } catch (error) {
        console.log(error);

        res.status(401).send({
            message: "User unauthorized"
        })
        return;

    }
}

const loginOperator = async (req, res) => {
    try {
        const { email, password } = req.body
        const isOperator = await UserModel.findOne({ email }).select("+password")

        if (!isOperator || isOperator.role !== "operator") {
            res.status(400).send({
                message: "operator account does not exist"
            })

            return;
        }

        const isMatch = await bcrypt.compare(password, isOperator.password)

        if (!isMatch) {
            res.status(400).send({
                message: "invalid credentials"
            })

            return
        }

        const token = jwt.sign({ id: isOperator._id, role: isOperator.role }, process.env.JWT_SECRET, { expiresIn: "10m", algorithm: "HS256" })

        res.status(200).send({
            message: "login successful",
            data: {
                firstname: isUser.firstname,
                lastname: isUser.lastname,
                email: isUser.email,
                role: isUser.role,

                token
            }
        })
    } catch (err) {
        res.status(400).send({
            message: "invalid credentials"
        })
    }
}

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        res.status(200).send({
            message: "User profile fetched successfully",
            data: user
        });
    } catch (err) {
        res.status(400).send({
            message: "Cannot fetch profile at this time"
        });
    }
}

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { role } = req.user
    const { firstname, lastname } = req.body
    try {
        if (role !== "operator" && role !== "admin") {
            return res.status(403).send({
                message: "Forbidden Resource"
            })
        }

        const allowedUpdate = {
            ...(firstname && { firstname: firstname.trim() }),
            ...(lastname && { lastname: lastname.trim() })
        }

        const updatedUser = await UserModel.findByIdAndUpdate({ id }, allowedUpdate, { returnDocument: "after", runValidators: true })

        if (!updateUser) {
            return res.status(400).send({
                message: "cannot update user at the time"
            })
        }

        res.status(200).send({
            message: "User Updated Successfully",
            data: updateUser,
        })
    } catch (error) {
        res.status(500).send({
            message: "cannot update user"
        }
        )
    }
}

const resolveAccount = async (req, res) => {
    const { accountNUmber } = req.params
    try {
        const user = await UserModel.findOne({ accountNumber })

        if (!user) {
            return res.status(404)({
                message: "cannot resolve account"
            })
        }

        res.status(200).send({
            message: "account retrieved",
            data: {
                accountname: user.firstname + " " + user.lastname,
                tag: user.tag ? user.tag : null,
            }
        }
        )
    } catch (error) {
        res.status(500)({
            message: "cannot resolve account number"
        })
    }
}

module.exports = {
    registerUser,
    registerOperator,
    getUsers,
    loginUser,
    verifyUser,
    loginOperator,
    getUserProfile,
    updateUser,
    resolveAccount
}