const User = require("../models/user");
const jwt = require("jsonwebtoken");
const uuidv1=require("uuidv1");
const crypto=require("crypto");
const userdb = require("../models/user")
const secretKey = process.env.JWT_SECRET
require("dotenv").config();

// send email 
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:'evenueproject@gmail.com',
        pass:'khwsihrbrhsvmrqx',
    },
});

exports.register = async (req,res) => {

    //const usernameExists = await User.findOne({
    //    username: req.body.username,
    //});

    const emailExists = await User.findOne({
        email: req.body.email,
    });

    //if(usernameExists) {
    //    return res.status(403).json({
    //        error: "username exists",
    //    });
    //}

    if(emailExists) {
        return res.status(403).json({
            error: "email exists",
        });
    }

    const user = new User(req.body);
    await user.save();

    res.status(201).json({
        message: "Signup Successful",
    });
};

exports.login = async (req, res) => {
	const { email, password } = req.body;
	
	await User.findOne({email}).exec((err,user) => {

		if(err || !user){
			return res.status(401).json({
				error: "Invalid Credentials",
			});
		}

		if(!user.authenticate(password)){
			return res.status(401).json({
				error: "Invalid email or password",
			});
		}

		const token = jwt.sign({ x_id: user._id}, process.env.JWT_SECRET, {
			expiresIn: "24h",
		});

		res.cookie("jwt",token,{expire: new Date() + 9999, httpOnly: true});

		//const { email } =user;
		return res.json({
			message: "Login Successful",
            //username,
		})
	});
}

exports.sendPasswordLink= async (req, res) => {

    console.log(req.body)

    const {email} = req.body;

    if(!email){
        res.status(401).json({status:401,message:"Enter your email"})
    }
    try{
        const userfind = await userdb.findOne({email:email})

        //console.log("userfind",userfind)
        
        // new token generation for resetting pwd

        const token = jwt.sign({_id:userfind._id},secretKey,{
            expiresIn:"300s"
        });
        console.log("token",token)

        const setusertoken = await userdb.findByIdAndUpdate({_id:userfind._id},{verifytoken:token},{new:true});
        

        //console.log("setusertoken",setusertoken)

        if(setusertoken){
            const mailOptions = {
                from:"evenueproject@gmail.com",
                to: email,
                subject: "Password Reset Email",
                text: `This link will be only valid for 5 mins http://localhost:3000/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`
            }

            transporter.sendMail(mailOptions,(error,info)=>{
                if(error){
                    console.log("error",error);
                    res.status(401).json({status:401,message:"email not sent"})
                }
                else{
                    console.log("Email successfully sent",info.response);
                    res.status(201).json({status:201,message:"Email sent successfully"})
                }
            })
        }

    }
    catch(error){

        res.status(401).json({status:401,message:"Invalid User!"})

    }

}

exports.verifyUser= async (req, res) => {
    const {id,token} = req.params;
    console.log(id,token);

    try{
        const validUser = await userdb.findOne({_id:id,verifytoken:token});
        //console.log(validUser);

        const verifyToken = jwt.verify(token,secretKey);

        if(validUser && verifyToken._id){
            res.status(201).json({status:201,validUser})
        }
        else{
            res.status(401).json({status:401,message:"User does not exist"})
        }
    }
    catch(error){
        res.status(401).json({status:401,error})
    }
}


exports.resetPassword= async (req, res) => {

    const {id,token,password} = req.body;

    try{

        // hash password
        const validUser = await userdb.findOne({_id:id});
        const hashPassword=validUser.encryptPassword(password)
    
        // update password
        await userdb.findOneAndUpdate(
            { _id: id },
            { hashedPassword: hashPassword }
        );
    
        res.status(201).json({status:201,password})
    } catch(error)
    {
        res.status(401).json({status:401,error})
    }

}

exports.logout = (req, res) => {
	// clear the cookie
	res.clearCookie("jwt");

	return res.json({
		message: "Logout Successful!",
	});
};

exports.getLoggedInUser = (req, res) => {
	const { email } = req.user;

	return res.status(200).json({
		message: "User is still logged in",
		email,
	});
};

