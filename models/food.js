var mongoose =require("mongoose");

var foodSchema = mongoose.Schema({
   
   food:{
      type:String,
      required:true
   },
   title:{
      type:String,
      required:true
   },
   image:{
      type:String,
      require:true
   },
   cost:{
      type:Number,
      require:true
   }
   
})
module.exports= mongoose.model("food",foodSchema)