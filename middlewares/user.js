const User = require("../models/user");
exports.userRegisterValidator =(req,res,next)=>{

    // first name is not empty
    req.check("firstname", "first name is required").notEmpty();

    // last name is not empty
    req.check("lastname", "last name is required").notEmpty();
    
    // username is not null
	//req.check("username", "Username is required").notEmpty();
    
    // email not null
    req.check("email", "Email is required").notEmpty();

    // invalid email
    req.check("email","Invalid Email").isEmail();

    // phone number not empty
    req.check("phone", "phone number is required").notEmpty();

    // check phone number has 10 digits
    req.check("phone")
        .isLength({min:10,max:10})
        .withMessage("Phone number should be 10 numbers")

    // password not null
    req.check("password", "Password is required").notEmpty();
    
    // password length 
    req.check("password")
        .isLength({min: 6})
        .withMessage("Password must contain atleast 6 characters")

    // does password contain an uppercase, lowercase, number, special characters
    req.check(
		"password",
		"Password must contain one uppercase, one lowercase, one number, and one special symbol"
	).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/, "i");

    // check if there are any errors
    const errors = req.validationErrors();
    if(errors){
        const firstError=errors.map((err)=>err.msg)[0];

        return res.status(400).json({
            error: firstError,
        })
    }

    next();
}
exports.userById = async (req, res, next) => {
	User.findById(req._id).exec((err, user) => {
		if (err || !user) {
			return res.status(404).json({
				error: "User not found",
			});
		}

		// add user object in req with all user info
		req.user = user;

		next();
	});
};
