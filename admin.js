const express =require("express")
const app =express.Router();
var emp=require("./models/employee")
var users=require("./models/user")
var food=require("./models/food")
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


app.get("/activeUser",check.admin,(req,res)=>{
   users.find({ isActive:true },(err,user)=>{
         if(err){
            res.redirect("/")
         }else{
            res.render("admin/activeUser",{data:user})
         }
   })
})



///////////////////////////  BLOCKED USERS   //////////////////////////////////////
app.get("/blockedUser",check.admin,(req,res)=>{
   users.find({ isActive:false,who:"client" },(err,user)=>{
      if(err){
            res.redirect("/")
      }else{
         res.render("admin/blockedUser",{data:user})
      }
         
   })
})



///////////////////////////  BLOCK THE USER   //////////////////////////////////////


app.get("/userBlock/:id",check.admin,(req,res)=>{
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


app.get("/userUnBlock/:id",check.admin,(req,res)=>{
   var id =req.params.id
   users.updateOne({uname:id}, {isActive:true}).then((doc)=>{
      
         if(!doc){
            res.redirect("/admin/blockedUser")
         }else{
            var dd={date:new Date(),borrow:0,complete:true}
            var data=JSON.stringify(dd)
            fs.open("./file/"+id+".txt","w",(err,fd)=>{
               if(err){
                  console.log("errorrr",err)
                  res.redirect("/")
               }else{
                  fs.writeSync(fd,data)
                  fs.writeSync(fd,"$")
                  fs.close(fd,(err)=>{
                     if(err){
                        console.log("error1",err)
                        res.redirect("/")
                     }else{
                        ("closed1 ")
                     }
                  })
               }
            })
               res.redirect("/admin/blockedUser")
         }
      })
})


///////////////////////////  CHANGE PASSWORD   //////////////////////////////////////


app.get("/changePassword/:id",check.admin,(req,res)=>{
   var id =req.params.id
   users.find({uname:id},(error,file)=>{
      if(error){
         res.redirect("/")
      }else{
         res.render("admin/changePassword",{data:file[0]})
      }
   })
})


app.post("/changePassword/:id",check.admin,(req,res)=>{
   var id =req.params.id
   users.updateOne({uname:id}, {password:req.body.password}).then((doc)=>{
            
      if(!doc.nModified){
         res.redirect("/admin/activeUser")
      }else{
            
            res.redirect("/admin/activeUser")
      }
   })
})






/////////////////////////  SUMMERY  ////////////////////////////////

app.get("/summery",check.admin,(req,res)=>{
    
   users.find({isActive:true},(err,file)=>{
      if(err){ 
         res.redirect("/admin/checker")
      }else{
         res.render("admin/summery.ejs",{data:file})
      }

   })
   
})

////////////////////////  CLEAR HIS PAST RECORD  /////////////////////////////////////////////////////
app.get("/clearData/:id",check.admin,(req,res)=>{
      var id=req.params.id
      
      var dd={date:new Date(),borrow:0,complete:true}
      var data=JSON.stringify(dd)
      fs.open("./file/"+id+".txt","w",(err,fd)=>{
         if(err){
            console.log("errorrr",err)
            res.redirect("/")
         }else{
            fs.writeSync(fd,data)
            fs.writeSync(fd,"$")
            fs.close(fd,(err)=>{
               if(err){
                  console.log("error1",err)
                  res.redirect("/")
               }else{
                  ("closed1 ")
               }
            })
         }
      })
      res.redirect("/admin/summery")

})


//////////////////////////////////  CLIENT TAKING BORROW  //////////////////////////////////////


app.post("/amount/:id",check.admin,(req,res)=>{

   var id=req.params.id;
   var amount=req.body.amount
   var data=fs.readFileSync("./file/"+id+".txt","utf-8")
   var file=data.split("$")
   file.pop()
   var data=new Date()
   var currentDate=data.getDate()
   var pastDate=JSON.parse(file[file.length-1]).date.substring(8,10)
     console.log(amount)
   if(currentDate!=pastDate){
      fs.open("./file/"+id+".txt","a+",(err,fd)=>{
         if(err){
            console.log("errorrr",err)
            res.redirect("/")
         }else{
            dd={date:new Date(),borrow:amount,complete:false}
            value=JSON.stringify(dd)
            fs.writeSync(fd,value)
            fs.writeSync(fd,"$")
            fs.close(fd,(err)=>{
               if(err){
                  console.log("error1",err)
                  res.redirect("/")
                  
               }else{
                  console.log("closed1 ")
               }
            })
         }
      })
   } else{
      fs.open("./file/"+id+".txt","a+",(err,fd)=>{
         if(err){
            console.log("errrr",err)
            res.redirect("/")
         }else{
            fscheck(id)
            var updateValue=JSON.parse(file[file.length-1])
            console.log(updateValue)
            updateValue.borrow=Number(updateValue.borrow)+Number(amount)
            updateValue.complete=false
            for(var i=0;i<file.length-1;i++){
               fs.writeSync(fd,file[i]+"$")
            }
            fs.writeSync(fd,JSON.stringify(updateValue)+"$")
            fs.close(fd,(err)=>{
               if(err){
                  console.log("some error")
                  res.redirect("/")
               }else{
                  console.log("done")
               }
            })
         }
      })
   }
         res.redirect("/admin/summery")

})


/////////////////////////  CLIENT PAYING HIS BORRROW  ///////////////////////////////////


app.get("/paid/:id/:date",check.admin,(req,res)=>{
   fs.open("./file/"+req.params.id+".txt","a+",(err,fd)=>{
         if(err){
            console.log("errors")
            res.redirect("/")
         }
         else{
               var date=req.params.date
               
               var data=fs.readFileSync("./file/"+req.params.id+".txt","utf-8")
               var file=data.split("$")
               file.pop()
               for(var i=0;i<file.length;i++){
                  var value=JSON.parse(file[i])
                  if(value.date==date){
                     
                        var temp={date:value.date,borrow:value.borrow,complete:true}
                        temp=JSON.stringify(temp)
                        file[i]=temp
                        console.log("after",file[i])
                        fscheck(req.params.id)
                        for(var i=0;i<file.length;i++){
                           console.log("some technical work")
                           fs.writeSync(fd,file[i]+"$")
                        }
                        break
                  }
               }
               fs.close(fd,(err)=>{
                  if(err){
                     console.log("err")
                     res.redirect("/")
                  }else{
                     console.log("done")
                  }
               })
         }
   })
   res.redirect("/summery/"+req.params.id)
})





function fscheck(id){
   fs.open("./file/"+id+".txt","w",(err,fd)=>{
      if(err){
         console.log("errorrr",err)
         res.redirect("/")
      }else{
         fs.writeSync(fd,"")
         fs.close(fd,(err)=>{
            if(err){
               console.log("error1",err)
               res.redirect("/")
            }else{
               console.log("closed1 ")
            }
         })
      }
   })
}
//true==payment completed false means not completled
module.exports=app