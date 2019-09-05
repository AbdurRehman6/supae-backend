const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema ({ 
    _id:mongoose.Schema.Types.ObjectId,
     createdDate:{type:String},
     ipAddress:{type:String},
     securityToken:{type:String},
     user:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
     isActive:{type:Boolean},
     deActiveTime:{type:String}
  });

  const Sessions = mongoose.model('Sessions',sessionSchema);
module.exports = Sessions;
