const express = require("express");
const router =express.Router();
const userdb = require("../models/user")
const jwt = require("jsonwebtoken")
const secretKey = process.env.JWT_SECRET

// send email 
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:'evenueproject@gmail.com',
        pass:'khwsihrbrhsvmrqx',
    },
});


// import controllers
const {register, login, sendPasswordLink, verifyUser, resetPassword, getLoggedInUser } =require("../controllers/user");

// import middleware
const {userRegisterValidator, userById}=require("../middlewares/user");
const { verifyToken } = require("../middlewares/auth");
const { info } = require("console");


// api route
router.post("/register",userRegisterValidator, register);
router.post("/login",login);
//email link for password reset
router.post("/sendpasswordlink",sendPasswordLink);
// Verifying user(Forgot password)
router.post("/forgotpassword/:id/:token",resetPassword)
// change password 
router.post("/:id/:token",verifyUser)

// find if the user is still logged in 
router.get("/user", verifyToken, userById, getLoggedInUser);

module.exports =router;
