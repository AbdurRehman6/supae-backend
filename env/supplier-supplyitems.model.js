const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const supplyItemSchema = new Schema({
    _id:mongoose.Schema.Types.ObjectId, 
    categories:{type:mongoose.Schema.Types.ObjectId, ref:'Categories'},  
   supplier:{type:mongoose.Schema.Types.ObjectId, ref:'Supplier'},
   createdDate:{type:String},  
    updateDate:{type:String}
   
});
const SupplyItems = mongoose.model('SupplyItems',supplyItemSchema);

module.exports = SupplyItems;