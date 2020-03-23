var passport=require("passport")
var LocalStrategy = require('passport-local').Strategy;
var user=require("../models/user.js")

passport.serializeUser((puser, done)=> {
   done(null, puser._id);
 });
 
 passport.deserializeUser((id, done)=> {
       user.findById(id,(err,users)=>{
          done(null,users)
       })
 });

 passport.use("login",new LocalStrategy({
    usernameField:"email",
    passwordField:"password",
    passReqToCallback:true

 },(req,email,password,done)=>{
      user.findOne({uname:email},(err,user)=>{
         if(err) {
            console.log("error",err)
            done(null,false)
         }
         if(user){
            if(user.password!=password){
                  console.log("password incorrect")
                  done(null,false)
            }
            else{
               console.log("login successfuly")
               done(null,user)
            }
         }
         else{
            console.log("username incorrect")
         done(null,false)
         }
      })
 }))