const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema ({ 
    _id:mongoose.Schema.Types.ObjectId, 
     email:{type:String,required:true,unique:true},
     password:{type:String,required:true},  
     status:{type:Boolean}, 
     address:{type:String},
     phone:{type:String},
     userType:{type:String,required:true}, 
     createdDate:{type:String},
     updatedDate:{type:String}
    
  });

  const User = mongoose.model('User',userSchema);
module.exports = User;
