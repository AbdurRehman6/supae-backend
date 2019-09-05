const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const productSchema = new Schema({
    _id:mongoose.Schema.Types.ObjectId,
    productName:{type:String},    
    region:{type:String},     
     price:{type:Number},
     unit:{type:String},
     description:{type:String},
     image:{type:String},
     inStock:{type:Boolean},
    createdDate:{type:String},
    updateDate:{type:String},
    categories:{type:mongoose.Schema.Types.ObjectId, ref:'Categories'},
});
const Products = mongoose.model('Products',productSchema);

module.exports = Products;
