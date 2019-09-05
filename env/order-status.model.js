const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderStatusLogSchema = new Schema({
    supplier:{type:mongoose.Schema.Types.ObjectId, ref:'Supplier'},  
    order:{type:mongoose.Schema.Types.ObjectId, ref:'Order',required:true},
    orderdetail:{type:mongoose.Schema.Types.ObjectId, ref:'OrderDetails'}, 
    updatedDate:{type:String},
    createdDate:{type:String},
    status:{type:String},
    reason:{type:String},
   kitchen:{type:mongoose.Schema.Types.ObjectId, ref:'Kitchen'},

});
const OrderStatusLog = mongoose.model('OrderStatusLog',orderStatusLogSchema);

module.exports = OrderStatusLog;