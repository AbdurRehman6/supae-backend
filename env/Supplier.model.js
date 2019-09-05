const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const supplierSchema = new Schema({
    _id:mongoose.Schema.Types.ObjectId,
    fullName:{type:String},
    companyName:{type:String},
    trnNumber:{type:Number},  
    user:{type:mongoose.Schema.Types.ObjectId, ref:'User',required:true},
    supplyItem:{type:String},   
    createdDate:{type:String},
    updateDate:{type:String},
});
const Supplier = mongoose.model('Supplier',supplierSchema);

module.exports = Supplier;
