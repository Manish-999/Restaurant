var mongoose =require("mongoose");

var employeSchema = mongoose.Schema({
   name:{
      type:String
   },
   image:{
      type:String
   },
   specialist:{
      type:String
   },
   mobile:{
      type:Number
   },
   date:{
      type:Date,
      default:Date.now
   }
})
module.exports= mongoose.model("employee",employeSchema)