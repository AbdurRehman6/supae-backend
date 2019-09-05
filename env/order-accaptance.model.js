const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const orderAcceptanceSchema = new Schema({
    _id:mongoose.Schema.Types.ObjectId,    
    takenQuantity:{type:String},    
   orderDetail:{type:mongoose.Schema.Types.ObjectId, ref:'OrderDetails',required:true}, 
   supplierRef:{type:mongoose.Schema.Types.ObjectId, ref:'SupplierRefStatus',required:true},
   supplier:{type:mongoose.Schema.Types.ObjectId, ref:'Supplier'}, 
   createdDate:{type:String},
   session:{type:mongoose.Schema.Types.ObjectId, ref:'Sessions'},  
    updateDate:{type:String}
   
});
const OrderAcceptance = mongoose.model('OrderAcceptance',orderAcceptanceSchema);

module.exports = OrderAcceptance;