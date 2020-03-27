const express =require("express")
const session=require("express-session")
var mongoose =require("mongoose");
var passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;
const bodyParser=require("body-parser")
const db=require("./routes/dbConnection.js")
const user=require("./models/user.js")
const emp=require("./models/employee.js")
const checkRes=require("./routes/checkRegistration.js")
const checkAC=require("./routes/checkAdminClient.js")
var passportss=require("./passport/passport.js")
var cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')(session);
var admin=require("./admin.js")


const app=express()
app.use(cookieParser("keep it secret"))
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
        maxAge:1000*60*60*24*30,
        secret:"keep it secret"
    }
  }))



app.use(passport.initialize());
app.use(passport.session());





//////////////  INDEX PAGE  /////////////////////

app.get("/",(req,res)=>{  
   
    if(req.user){
        
    res.render("home.ejs",{data:false,member:false});
    }
    else{
        
    res.render("home.ejs",{data:false,member:true});
    }
    
    
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


//////////////  logout PAGE  /////////////////////

app.get("/logout",(req,res)=>{  
   
    req.logout();
    res.render("home.ejs",{data:false,member:true})
    
    
})

/////////////////////  REGISTRATION PAGE  ///////////////////////////////

app.route("/registration").all((req,res,next)=>{
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
        newUser.isActive=true;
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
                res.render("home",{data:true,member:true});
            }
        })
    }
})



//////////////////////////  MENU PAGE  ////////////////////////////

app.get("/menu",(req,res)=>{

    if(req.user){
        res.render("Menu.ejs",{member:false});
    }
    else{
        res.render("Menu.ejs",{member:true});
    }
})




//////////////////////////  checker  ////////////////////////////

app.get("/checker",checkAC.admin,(req,res)=>{
    if(req.user){
        if(req.user.who=="client"){
            res.render("client/profile")
        }
        if(req.user.who=="admin"){
            emp.find({},(err,file)=>{
                
            res.render("admin/index",{data:file})
            })
        }
    }
    else{
        res.render("home.ejs",{data:false,member:true})
    }
})


app.use("/admin",admin)



app.listen(3000,()=>{
    console.log("listening port 3000")
})