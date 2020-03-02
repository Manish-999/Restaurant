function check(data){
   if(data.fname.length==0 && data.lname.length==0 && data.uname.length==0 && data.password.length==0 && data.mobile.length != 10){
      return false;
   }
   if(data.email.length !=0){
      var num=data.email.search(/@gmail.com/i);
      if(num == -1){
         return false;
      }
   }
}


module.exports=check;