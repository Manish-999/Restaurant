const express =require("express")
const mysql=require("mysql")
const session=require("express-session")
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;
const bodyParser=require("body-parser")
const db=require("./routes/dbConnection.js")
const checkRes=require("./routes/checkRegistration.js")


const app=express()
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())
app.use(express.static('./public'))
app.set('view engine','ejs')



var sessionStore = new MySQLStore(db);


app.use(session({
    secret: "don't mess with it",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());


//////////////  INDEX PAGE  /////////////////////

app.get("/",(req,res)=>{  
   
    res.render("home.ejs");
    db.query("SELECT * FROM data",(err,res,field)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log("connected",res);
        }
    })
    
})


////////////////  LOGIN PAGE  //////////////////////////////

app.get("/login",(req,res)=>{
    res.render("login");
})


app.post("/login",(req,res)=>{

})


/////////////////////  REGISTRATION PAGE  ///////////////////////////////

app.route("/registration").all((req,res,next)=>{
    next()
})
.get((req,res)=>{
    res.render("registration",{data : false});
   
})
.post((req,res)=>{
    var result=checkRes(req.body);
    if(result==false){
        console.log("false");
        res.render("registration",{data : true});
    }
    else{
        db.query("insert into data (fname,lname,uname,pass,email,mobile,auth) values (?,?,?,?,?,?,'client')",[req.body.fname , req.body.lname , req.body.uname , req.body.password , req.body.email , req.body.mobile],(err,result,field)=>{
            if(!err){
                db.query('SELECT LAST_INSERT_id()',(errs,results,fields)=>{
                    if(!err){
                        console.log(results[0])
                    }
                })
            }
            else {
                console.log(err)
            }
        })
    }
})



//////////////////////////  MENU PAGE  ////////////////////////////

app.get("/menu",(req,res)=>{
    res.render("Menu")
})


////////////////// ERROR HANDLER FOR MYSQL////////////////////////////////////
db.on('error', function(err) {
    console.log("Fatal error ",err.code);
});


app.listen(3000,()=>{
    console.log("listening port 3000")
})