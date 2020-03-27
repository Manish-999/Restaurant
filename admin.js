const express =require("express")
const app =express.Router();
var emp=require("./models/employee")
var users=require("./models/user")
const bodyParser=require("body-parser")
var multer=require("multer")
var fs=require("fs")
var check=require("./routes/checkAdminClient")




app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())


var storage = multer.diskStorage({
   destination: function (req, file, cb) {
     cb(null, './public/employee')
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



///////////////////////////  REGISER EMPLOYEE  ////////////////////////////////



app.get("/register",check.admin,(req,res)=>{
   res.render("admin/register",{msg:""})
})
app.post("/register",check.admin,(req,res)=>{
      upload(req,res,(err)=>{
         if(err){
            if(err.message)
                  res.render("admin/register",{msg:"Image size too Large Keep it under 500 KB"})
            else{
               res.render("admin/register",{msg:err})
            }
         }
         else{
               var newUser=new emp();
               newUser.name=req.body.name;
               newUser.specialist=req.body.specialist;
               newUser.image=req.file.filename;
               newUser.mobile=req.body.mobile;
               newUser.save((err)=>{
                  if(err){
                     res.render("admin/register",{msg:""})
                  }
                  else{
                     res.redirect("/checker")
                  }
               })
         }
      })
})



////////////////////////////  DELETE EMPLOYEE DATA  ////////////////////////////////////////

app.get("/delete/:id",check.admin,(req,res)=>{
   var id=req.params.id
   emp.findById(id,(err,user)=>{
      emp.deleteOne({name : user.name, specialist : user.specialist },(err)=>{
         if(err){
            res.redirect("/error")
         }
         else{
            fs.unlink("./public/employee/"+user.image,(err)=>{
               if(err){
                  res.redirect("/error")
               }
               else{
                  res.redirect("/checker")
               }
            })
         }
      })
   })
})



///////////////////////////  ACTIVE USERS   //////////////////////////////////////


app.get("/activeUser",(req,res)=>{
   users.find({ isActive:true },(err,user)=>{
         res.render("admin/activeUser",{data:user})
   })
})



///////////////////////////  BLOCKED USERS   //////////////////////////////////////
app.get("/blockedUser",(req,res)=>{
   users.find({ isActive:false,who:"client" },(err,user)=>{
         res.render("admin/blockedUser",{data:user})
   })
})



///////////////////////////  BLOCK THE USER   //////////////////////////////////////


app.get("/userBlock/:id",(req,res)=>{
         var id =req.params.id
         users.updateOne({uname:id}, {isActive:false}).then((doc)=>{
            
               if(!doc){
                  res.redirect("/admin/activeUser")
               }else{
                     res.redirect("/admin/activeUser")
               }
            })
})



///////////////////////////  UNBLOCK THE USER   //////////////////////////////////////


app.get("/userUnBlock/:id",(req,res)=>{
   var id =req.params.id
   users.updateOne({uname:id}, {isActive:true}).then((doc)=>{
      
         if(!doc){
            res.redirect("/admin/blockedUser")
         }else{
               res.redirect("/admin/blockedUser")
         }
      })
})


///////////////////////////  CHANGE PASSWORD   //////////////////////////////////////


app.get("/changePassword/:id",(req,res)=>{
   var id =req.params.id
   users.find({uname:id},(error,file)=>{
      res.render("admin/changePassword",{data:file[0]})
   })
})


app.post("/changePassword/:id",(req,res)=>{
   var id =req.params.id
   users.updateOne({uname:id}, {password:req.body.password}).then((doc)=>{
            
      if(!doc.nModified){
         res.redirect("/admin/activeUser")
      }else{
            res.redirect("/admin/activeUser")
      }
   })
})


module.exports=app