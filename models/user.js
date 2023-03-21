const mongoose=require("mongoose");
const uuidv1=require("uuidv1");
const crypto=require("crypto");

const userSchema=new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
        },
        phone:{
            type: String,
        },
        firstname:{
            type: String,
            required: true,
        },
        lastname:{
            type:String,
            required: true,
        },
        hashedPassword:{
            type: String,
            required: true,
        },
        salt: String,
    },  
    {
    timestamps:true,
    },
);


userSchema.virtual("password").set(function (password){
    this._password=password;

    this.salt=uuidv1();

    this.hashedPassword=this.encryptPassword(password);
});

userSchema.methods={
    encryptPassword: function (password) {
        if(!password) return "";

        try{
            return crypto
                .createHmac("sha256",this.salt)
                .update(password)
                .digest("hex");

        } catch(err) {
            return "";
        }
    },

    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashedPassword;        
    },
}

module.exports=mongoose.model("User",userSchema);