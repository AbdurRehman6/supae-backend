const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const orderFulfillmentSchema = new Schema({
    _id:mongoose.Schema.Types.ObjectId, 
   product:{type:mongoose.Schema.Types.ObjectId, ref:'Products',required:true}, 
   takenQuantity:{type:String}, 
   order:{type:mongoose.Schema.Types.ObjectId, ref:'Order',required:true},       
   orderDetail:{type:mongoose.Schema.Types.ObjectId, ref:'OrderDetails'}, 
   referenceNumber:{type:String},
   reason:{type:String},
   supplier:{type:mongoose.Schema.Types.ObjectId, ref:'Supplier'},
   isActive:{type:Boolean},
   status:{type:String},
   partialType:{type:String},
   createdDate:{type:String},   
   session:{type:mongoose.Schema.Types.ObjectId, ref:'Sessions'},  
   updateDate:{type:String}
   
});
const OrderAcceptance = mongoose.model('OrderAcceptance',orderFulfillmentSchema);

module.exports = OrderAcceptance;