const express =require("express")
const mysql=require("mysql")
const bodyParser=require("body-parser")
const db=require("./routes/dbConnection.js")


const app=express()
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())
app.use(express.static('./public'))
app.set('view engine','ejs')


//////////////  INDEX PAGE  /////////////////////

app.get("/",(req,res)=>{  
   
    res.render("home.ejs");
    
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
    res.render("registration");
   
})
.post((req,res)=>{
    console.log(req.body.fname);
    console.log(req.body.lname);
    console.log(req.body.uname);
    console.log(req.body.password);
    console.log(req.body.email);
    console.log(req.body.mobile);

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