const UserModel = require("../models/user.model");
const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    const saltround = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, saltround);

    const user = await UserModel.create({
      firstname,
      lastname,
      email,
      password: hashed,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h", algorithm: "HS256" },
    );

    res.status(201).send({
      message: "user created successfully",
      data: {
        firstname,
        lastname,
        email,
        token,
      },
    });
  } catch (error) {
    console.log(error);

    if ((error.code === 11000)) {
      res.status(400).send({
        message: "user already exist",
      });
    } else {
      res.status(400).send({
        message: "user cannot be created at this time",
      });
    }
  }
};

const registerVendor = async (req, res) => {
  try {
    const { firstname, lastname, email, password, role="vendor" } = req.body;

    const saltround = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, saltround);

    const user = await UserModel.create({
      firstname,
      lastname,
      email,
      password: hashed,
      role
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h", algorithm: "HS256" },
    );

    res.status(201).send({
      message: "vendor created successfully",
      data: {
        firstname,
        lastname,
        email,
        token,
      },
    });
  } catch (error) {
    console.log(error);

    if ((error.code === 11000)) {
      res.status(400).send({
        message: "vendor already exist",
      });
    } else {
      res.status(400).send({
        message: "vendor cannot be created at this time",
      });
    }
  }
};

const getUsers = async (req, res) => {
  const { id, role } = req.user;
  try {
    if (role != "admin") {
      res.status(403).send({
        message: "Forbidden resource",
      });

      return;
    }

    const users = await UserModel.find();

    res.status(200).send({
      message: "all users fetched successfully",
      data: users,
    });
  } catch (error) {
    res.status(400).send({
      message: "users cannot be fetched at this time",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const isUser = await UserModel.findOne({ email }).select("+password");

    if (!isUser) {
      res.status(400).send({
        message: "account does not exist",
      });

      return;
    }

    const isMatch = await bcrypt.compare(password, isUser.password);

    if (!isMatch) {
      res.status(400).send({
        message: "invalid credentials",
      });

      return;
    }
    const token = jwt.sign(
      { id: isUser._id, role: isUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h", algorithm: "HS256" },
    );
    res.status(200).send({
      message: "login successful",
      data: {
        firstname: isUser.firstname,
        lastname: isUser.lastname,
        email: isUser.email,
        token,
      },
    });
  } catch (error) {
    res.status(400).send({
      message: "invalid credentials",
    });
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers["authorization"].split(" ")[1]
      ? req.headers["authorization"].split(" ")[1]
      : req.headers["authorization"].split(" ")[0];

    const user = await jwt.verify(
      token,
      process.env.JWT_SECRET,
      function (err, decoded) {
        if (err) {
          res.status(401).send({
            message: "User unauthorized!",
          });
          return;
        }

        req.user = decoded;
        console.log(decoded);

        next();
      },
    );
  } catch (error) {
    console.log(error);

    res.status(401).send({
      message: "User unauthorized!",
    });
    return;
  }
};

module.exports = {
  registerUser,

  getUsers,
  loginUser,

  verifyUser,
  registerVendor
};