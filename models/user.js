var mongoose =require("mongoose");

var userSchema = mongoose.Schema({
   name:{
      fname:{
         type:String,
         required:true
      },

      lname:{
         type:String,
         required:true
      }
   },
   uname: {
      type:String,
      unique:true,
      required:true
   },
   password: {
      type:String,
      required:true
   },
   email: {
      type:String,
      unique:true,
      required:true
   },
   mobile: {
      type: Number,
      unique:true,
      required:true
   },
   date: {
      type:Date,
      default:Date.now
   },
   who: {
      type:String,
      default:"client"
   },
   isActive:{
      type:Boolean,
      default:false
   }
   
})
module.exports= mongoose.model("user",userSchema)