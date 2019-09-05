const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const kitchenSchema = new Schema ({ 
  _id:mongoose.Schema.Types.ObjectId,
  kitchenName:{type:String},
  type:{type:String},
  user:{type:mongoose.Schema.Types.ObjectId, ref:'User',required:true},
  createdDate:{type:String},
  updateDate:{type:String}, 
});


const Kitchen = mongoose.model('Kitchen',kitchenSchema);
module.exports = Kitchen;
