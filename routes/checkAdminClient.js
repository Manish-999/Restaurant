function admin(req,res,next){
   if(req.user){
       if(req.user.who=="admin"){
           next()
       }
       else{
           res.redirect("/")
       }
   }
   else(
      res.redirect("/")
   )
}


function client(req,res,next){
   if(req.user){
       if(req.user.who=="client"){
           if(req.user.isActive){
               next()
           }
       }
       else{
           res.redirect("/")
       }
   }   
}


module.exports={admin,client};
