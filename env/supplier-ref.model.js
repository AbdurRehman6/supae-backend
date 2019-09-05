const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const supplierrefSchema = new Schema({
    _id:mongoose.Schema.Types.ObjectId,   
    supplierOrderRefrence:{type:String}, 
      status:{type:String},
      partialType:{type:String},
   createdDate:{type:String},
   session:{type:mongoose.Schema.Types.ObjectId, ref:'Sessions'},  
    updateDate:{type:String}
   
});
const SupplierRefStatus = mongoose.model('SupplierRefStatus',supplierrefSchema);

module.exports = SupplierRefStatus;