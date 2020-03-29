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


function clientActive(req,res,next){
   if(req.user){
       if(req.user.who=="client"){
           if(req.user.isActive){
               next()
           }
       }
       else{
           res.redirect("/")
       }
   }else{
        res.redirect("/")
    }
}

function allowSummery(req,res,next){
    if(req.user){
        if(req.user.who=="client"){
            if(req.user.isActive){
                next()
            }else{
                res.redirect("/checker")
            }
        }else{
            if(req.user.who=="admin"){
                next()
            }else{
                res.redirect("/")
            }
        }
    }else{
        res.redirect("/")
    }
 }

function clientNotActive(req,res,next){
    if(req.user){
        if(req.user.who=="client"){
            if(!req.user.isActive){
                next()
            }
        }
        else{
            res.redirect("/")
        }
    }else{
        res.render("/")
    }   
 }


 function LRcheck(req,res,next){
     if(!req.user){
        next()
     }else{
        res.redirect("/checker")
     }
     
     
 }
module.exports={admin,clientActive,clientNotActive,LRcheck,allowSummery};
