const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const forgotPasswordSchema = new Schema ({ 
  _id:mongoose.Schema.Types.ObjectId,
  token:{type:String,required:true},
  expiryDate:{type:String},
  user:{type:mongoose.Schema.Types.ObjectId, ref:'User',required:true},
  createdDate:{type:String},
  updateDate:{type:String}, 
});


const ForgotPassword = mongoose.model('ForgotPassword',forgotPasswordSchema);
module.exports = ForgotPassword;