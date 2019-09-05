const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const WishListSchema = new Schema ({ 
  _id:mongoose.Schema.Types.ObjectId,
  kitchen:{type:mongoose.Schema.Types.ObjectId, ref:'Kitchen',required:true},
  product:{type:mongoose.Schema.Types.ObjectId, ref:'Products',required:true},  
  user:{type:mongoose.Schema.Types.ObjectId, ref:'User',required:true},
  createdDate:{type:String},
  updateDate:{type:String}, 
});


const wishList = mongoose.model('wishList',WishListSchema);
module.exports = wishList;