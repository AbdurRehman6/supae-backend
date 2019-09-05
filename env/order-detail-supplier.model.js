const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderDetailSupplierSchema = new Schema({
    _id:mongoose.Schema.Types.ObjectId,
    quantity:{type:String},   
    product:{type:mongoose.Schema.Types.ObjectId, ref:'Products',required:true},
//product:{type:String},
order:{type:mongoose.Schema.Types.ObjectId, ref:'Order'}, 

   supplier:{type:mongoose.Schema.Types.ObjectId, ref:'Supplier'},  
   orderDetail:{type:mongoose.Schema.Types.ObjectId, ref:'OrderDetails',required:true}, 
   updatedDate:{type:String},
   createdDate:{type:String},
   session:{type:mongoose.Schema.Types.ObjectId, ref:'Sessions'},
   orderDetailSupplierStatus:{type:String}, 
});
const orderDetailSupplier = mongoose.model('orderDetailSupplier',orderDetailSupplierSchema);

module.exports = orderDetailSupplier;
