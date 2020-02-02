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

app.listen(3000,()=>{
    console.log("its work")
})