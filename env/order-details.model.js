const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderDetailsSchema = new Schema({
    _id:mongoose.Schema.Types.ObjectId,
    orderQuantity:{type:String},
    remainingQuantity:{type:String},
   product:{type:mongoose.Schema.Types.ObjectId, ref:'Products',required:true},  
   order:{type:mongoose.Schema.Types.ObjectId, ref:'Order',required:true}, 
   updatedDate:{type:String},
   createdDate:{type:String},
   session:{type:mongoose.Schema.Types.ObjectId, ref:'Sessions'}, 
   orderDetailStatus:{type:String}
});
const OrderDetails = mongoose.model('OrderDetails',orderDetailsSchema);

module.exports = OrderDetails;
