const express =require("express")
const session=require("express-session")
var mongoose =require("mongoose");
var passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;
const bodyParser=require("body-parser")
const db=require("./routes/dbConnection.js")
const user=require("./models/user.js")
const checkRes=require("./routes/checkRegistration.js")
var passportss=require("./passport/passport.js")
var cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')(session);


const app=express()
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())
app.use(express.static('./public'))
app.set('view engine','ejs')

app.use(session({
    secret: 'keep it secret',
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    resave: true,
    saveUninitialized: true,
    cookie:{
        maxAge: 60*1000*60*24*30,
        httpOnly: true
    }
  }))



app.use(passport.initialize());
app.use(passport.session());





//////////////  INDEX PAGE  /////////////////////

app.get("/",(req,res)=>{  
   
    res.render("home.ejs",{data:false});
    
    
})


////////////////  LOGIN PAGE  //////////////////////////////
app.route("/login",(req,res,next)=>{
    next()
})
.get((req,res)=>{
    res.render("login");
})
.post(passport.authenticate("login",{
    successRedirect:"/checker",
    failureRedirect:"/login"
}))


/////////////////////  REGISTRATION PAGE  ///////////////////////////////

app.route("/registration").all((req,res,next)=>{
    console.log(req.user)
    next()
})
.get((req,res)=>{
    res.render("registration",{data : false,data1:false});
   
})
.post((req,res)=>{
    var result=checkRes(req.body);
    var data=req.body;
    if(result==false){
        console.log("false");
        res.render("registration",{data : true,data1:false});
    }
    else{
        var newUser=new user();
        newUser.name.fname=req.body.fname;
        newUser.name.lname=req.body.lname;
        newUser.uname=req.body.uname;
        newUser.password=req.body.password;
        newUser.email=req.body.email;
        newUser.mobile=req.body.mobile;
        newUser.save((err)=>{
            if(err){
                console.log("some error",err)
                if(err.keyPattern.uname)
                    res.render("registration",{data:false,data1:"User name"});
                if(err.keyPattern.email)
                        res.render("registration",{data:false,data1:"Email"});
                if(err.keyPattern.mobile)
                            res.render("registration",{data:false,data1:"Mobile Number"});
                
            }
            else{
                console.log("now your data is saved..contect to resturant for activate your account")
                res.render("home",{data:true});
            }
        })
    }
})



//////////////////////////  MENU PAGE  ////////////////////////////

app.get("/menu",(req,res)=>{
    res.render("Menu")
})




//////////////////////////  checker  ////////////////////////////

app.get("/checker",(req,res)=>{
    if(req.user.who=="client"){
        res.render("client/profile")
    }
    if(req.user.who=="admin"){
        res.render("admin/index")
    }
})



app.listen(3000,()=>{
    console.log("listening port 3000")
})