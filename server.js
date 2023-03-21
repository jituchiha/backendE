const express = require("express");
const { json, urlencoded } = express;
const mongoose = require('mongoose');
const morgan = require('morgan');
var session = require('express-session')
const cors = require("cors");
const bodyParser = require('body-parser')
const request = require('request')

require("dotenv").config();
const cookieParser = require("cookie-parser")
const expressValidator = require("express-validator")

// app
const app = express();

// middleware
app.use(cors({origin: true, credentials: true}));
app.use(morgan("dev"));
app.use(json());
app.use(urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());

// db
mongoose.connect(process.env.ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected"))

// routes
const userRoutes = require("./routes/user");
app.use ("/", userRoutes);

// port
const port = process.env.PORT || 5000;
 
const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

app.get('/', (req, res) => {
    res.sendFile('index.js', {root: '../client/src'})
});


// captcha 
// app.set('trust proxy', 1) // trust first proxy
// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: true, sameSite: 'none' }
// }))
// app.post('/register', (req, res) => {
//     console.log("Im here")
//     if(
//         req.body.captcha === undefined ||
//         req.body.captcha === '' ||
//         req.body.captcha === null
//     ){
//         console.log('null')
//         return res.json({"success": false, 'msg': 'Please select captcha'});
//     }

//     const secretKey = process.env.RECAPTCHA_SECRET_KEY;

//     const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}`;

//     request(verifyUrl, (error, response, body) => {
//         console.log("HEY THERE")
//         // body = JSON.parse(body);
//         console.log(body);

//         if(body.success !== undefined && !body.success) {
//             return res.json({"success": false, 'msg': 'Failed verification'});
//         }

//         return res.json({"success": true, 'msg': 'Verified'});
//     });
// });