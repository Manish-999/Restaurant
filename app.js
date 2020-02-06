const express =require("express")
const bodyParser=require("body-parser")


const app=express()
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())
app.use(express.static('./public'))
app.set('view engine','ejs')


//index page
app.get("/",(req,res)=>{  
    res.render("home.ejs");
})



app.get("/login",(req,res)=>{
    res.render("login");
})

app.post("/login",(req,res)=>{

})





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


app.get("/menu",(req,res)=>{
    res.render("Menu")
})
app.listen(3000,()=>{
    console.log("listening port 3000")
})