const express = require('express');
const router = express.Router();
const Supplier = require('../../env/Supplier.model');
const mongoose = require('mongoose');

//Get All date using Get request from Supplier Collection
router.get('/',(req,res,next) => {     
    Supplier.find()
    .exec()
    .then(docs =>{
        console.log(docs);
        res.status(200).json(docs)
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});

//Post Request To Add Kitchen data in collection
router.post('/',(req,res,next) => {  
    const date = new Date;
       // const uniqueId =uuid.v4();
    const supplier = new Supplier({  
        _id:mongoose.Types.ObjectId(),          
        companyName:req.body.companyName,
        email:req.body.email,
        password:req.body.password,  
        address:req.body.address,
        phone:req.body.phone,
        supplyItem:req.body.supplyItem,    
        status:req.body.status,
        createdDate:date.toString(),
        updateDate:date.toString(),
  
    
    }); 
    supplier.save().then(result =>{
       console.log(result);
       res.status(201).json({
       createdKitchen:result
        });
    }).catch(err =>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    });
    });

    // Get Supplier Data from Supplier collection based on id
    router.get('/:supplierId',(req,res,next) =>{
        const id = req.params.supplierId
        Supplier.findById(id)
        .exec()
        .then(doc =>{
           if(doc)
           {
             res.status(200).json(doc);
           }
           else
           {
               res.status(404).json({
                   message:"no valid entry found against this id"
               });
           }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({})
        });
     });

         //update Kitchen Data against KitchenId
    router.patch('/:supplierId',(req,res,next) =>{
        const id = req.params.supplierId;
        console.log(req);
        const updatedDate = new Date;
      Supplier.update({_id:id},{$set:{
        companyName:req.body.companyName,
        address:req.body.address,
        phone:req.body.phone,
        supplyItem:req.body.supplyItem,
        updateDate:updatedDate.toString(),
        status:req.body.status,
        }})
      .exec()
      .then(result =>{
          console.log(result);
          res.status(200).json(result);
      })
      .catch(err =>{
          console.log(err);
          res.status(500).json({
              error:err
          });
      })
    });

     //Delete data from Supplier collection against Supplier id
     router.delete('/:supplierId',(req,res,next) =>{
        const id = req.params.supplierId;
        
      Supplier.remove({_id:id})
      .exec()
      .then(result =>{
          res.status(200).json(result)
      })
      .catch(err =>{
          console.log(err);
          res.status(500).json({
              error:err
          })
      });
     });

     
module.exports =router;