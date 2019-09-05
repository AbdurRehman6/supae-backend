const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const categoriesSchema = new Schema({
    _id:mongoose.Schema.Types.ObjectId,
    categoryName:{type:String},    
    categoryImage:{type:String},
    // parentId:{type:Number},  
     parentId:{type:mongoose.Schema.Types.ObjectId, ref:'Categories',default:null},
    createdDate:{type:String},
    updateDate:{type:String},
    
});
const Categories = mongoose.model('Categories',categoriesSchema);

module.exports = Categories;
