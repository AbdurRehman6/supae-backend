const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const orderSchema = new Schema({
    _id:mongoose.Schema.Types.ObjectId,
    orderRefrence:{type:String},
    totalPrice:{type:Number},  
    orderQuantity:{type:String},
    isActive:{type:Boolean,default:true},  
   kitchen:{type:mongoose.Schema.Types.ObjectId, ref:'Kitchen',required:true},
//    supplier:{type:mongoose.Schema.Types.ObjectId, ref:'Supplier',default:null},
   deleviryDate:{type:String},
   qaDate:{type:String},
   createdDate:{type:String},
   session:{type:mongoose.Schema.Types.ObjectId, ref:'Sessions'},
    status:{type:String}, 
    orderType:{type:String},
    updateDate:{type:String}
   
});
const Order = mongoose.model('Order',orderSchema);

module.exports = Order;
