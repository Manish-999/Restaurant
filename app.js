const express =require("express")
const bodyParser=require("body-parser")
const session=require("express-session")
var mongoose =require("mongoose");
var passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;
const db=require("./routes/dbConnection.js")
const user=require("./models/user.js")
const food=require("./models/food.js")
const emp=require("./models/employee.js")
const checkRes=require("./routes/checkRegistration.js")
const checkAC=require("./routes/checkAdminClient.js")
var passportss=require("./passport/passport.js")
var cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')(session);
var admin=require("./admin.js")
var fs=require("fs")
var multer=require("multer")


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


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname+'/public/food/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+"-"+file.originalname)
    }
  })
   
  var upload = multer({ storage: storage,
                         limits:{
                            fileSize:1024*500
                         } ,
                         fileFilter:(req,file,cb)=>{
                            if(file.mimetype=="image/png" || file.mimetype=="image/jpeg" || file.mimetype=="image/jpg"){
                                 
                               cb(null,true)
                            }
                            else{
                               cb("use only png, jpeg, jpg formate",false)
                            }
                         }
                      }).single("image")
 



//////////////  INDEX PAGE  /////////////////////

app.get("/",(req,res)=>{  
   
    if(req.user){
        
    res.render("home.ejs",{member:false});
    }
    else{
        
    res.render("home.ejs",{member:true});
    }
    
    
})


////////////////  LOGIN PAGE  //////////////////////////////
app.route("/login",(req,res,next)=>{
    next()
})
.get(checkAC.LRcheck,(req,res,next)=>{
    res.render("login");
})
.post(passport.authenticate("login",{
    successRedirect:"/checker",
    failureRedirect:"/login"
}))


//////////////  logout PAGE  /////////////////////

app.get("/logout",(req,res)=>{  
   
    req.logout();
    res.render("home.ejs",{member:true})
    
    
})

/////////////////////  REGISTRATION PAGE  ///////////////////////////////

app.route("/registration").all((req,res,next)=>{
    next()
})
.get(checkAC.LRcheck,(req,res,next)=>{
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
                user.findOne({uname:req.body.uname},(err,file)=>{
                    if(err){
                        console.log("err1")
                        res.redirect("/")
                    }else{
                            req.login(file,(err)=>{
                                    if(err){
                                        console.log("err2")
                                        res.redirect("/")
                                    }else{
                                            res.redirect("/checker")
                                    }
                            })
                    }
                    
                })
            }
        })
    }
})



//////////////////////////  MENU PAGE  ////////////////////////////

app.get("/menu",(req,res)=>{
    food.find({},(err,data)=>{
        if(err){
            res.redirect("/")
        }else{
            if(req.user){
                if(req.user.who=="admin"){
    
                    res.render("Menu.ejs",{member:false,allow:true,file:data});
    
                }else{
                    res.render("Menu.ejs",{member:false,allow:false,file:data})
                }
            }
            else{
                res.render("Menu.ejs",{member:true,allow:false,file:data});
            }
        }
    })

    
})


//////////////////////////////////  MENU UPDATE //////////////////////////////////////

app.route("/menu/add",(req,res,next)=>{
    next()
})
.get(checkAC.admin,(req,res)=>{
    res.render("menuAdd.ejs",{msg:""});
})
app.post("/menu/add",(req,res)=>{
    upload(req,res,(err)=>{
        if(err){
           if(err.message)
                 res.render("menuAdd",{msg:"Image size too Large Keep it under 500 KB"})
           else{
              res.render("menuAdd",{msg:err})
           }
        }
        else{
            var newUser=new food();
            newUser.title=req.body.name;
            newUser.food=req.body.item;
            newUser.image=req.file.filename;
            newUser.cost=req.body.cost;
            newUser.save((err)=>{
               if(err){
                  res.render("menuAdd",{msg:"Some technical problem please contact to developer"})
               }
               else{
                  res.redirect("/menu")
               }
            })
      
        }
     })
})



app.get("/menu/delete/:id/:id2",(req,res)=>{
    var name=req.params.id;
    var imageName=req.params.id2
        food.deleteOne({title:name },(err)=>{
           if(err){
              res.redirect("/")
           }
           else{
              fs.unlink("./public/food/"+imageName,(err)=>{
                 if(err){
                    res.redirect("/")
                 }
                 else{
                    res.redirect("/menu")
                 }
              })
           }
        })
})



//////////////////////////  checker  ////////////////////////////

app.get("/checker",(req,res)=>{
    console.log("some technical work delayyyy")
    console.log("some technical work delayyyy")
    console.log("some technical work delayyyy")
    if(req.user){
        if(req.user.who=="client"){
            user.findOne({uname:req.user.uname},(err,file)=>{

                if(req.user.isActive){
                    res.render("client/profile",{msg:["",file]})
                }else{
                    res.render("client/profile",{msg:["Your account is not activate. Please contect to Pandey Restaurant for activate your account",file]})
                }
            })
            
        }else{
            if(req.user.who=="admin"){
                emp.find({},(err,file)=>{
                    
                res.render("admin/index",{data:file})
                })
            }
        }
        
    }
    else{
        res.render("home.ejs",{member:true})
    }
})


////////////////////////////  SUMMERY OF USER  //////////////////////////////
app.get("/summery/:id",checkAC.allowSummery,(req,res)=>{
    
    var info=fs.readFileSync("./file/"+req.params.id+".txt","utf-8")
    var file=info.split("$")
    file.pop()
    res.render("summery.ejs",{data:file,who:req.user.who,name:req.params.id})
    
 })


app.use("/admin",admin)


app.listen(process.envPORT||3000,()=>{
    console.log("listening port 3000")
})