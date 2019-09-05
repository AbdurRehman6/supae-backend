const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const kitchenSchema = new Schema({
   // _id:new mongoose.Types.ObjectId,
    AccountName:String,
    AccountType:String,
    AccountNumber:String,
    LastOrder:String,
    Status:Boolean,default:true, 
    createdDate:String,
    UpdateDate:String,
},{
    collation:'kitchens'
});

const Kitchen = mongoose.model('Kitchen',kitchenSchema);
module.exports = Kitchen;