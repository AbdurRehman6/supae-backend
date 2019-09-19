const express = require('express');
const router = express.Router();
const Kitchen = require('../../env/kitchens.model')
const mongoose = require('mongoose');
//const bcrypt = require('bcrypt');
const bcrypt = require('bcrypt-nodejs');
const User = require('../../env/user.model');
const Supplier = require('../../env/Supplier.model');
const Sessions = require('../../env/session.model');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
const checkAuth = require('../middleware/auth-check')
const Order = require('../../env/orders.model')
const OrderDetail = require('../../env/order-details.model');
const Products = require('../../env/product.model');
const SupplyItems = require('../../env/supplier-supplyitems.model');


//Get All date using Get request from Kitchen Collection
router.get('/getkitchens',(req,res,next) =>{  
    Kitchen.find({}) 
    .select('kitchenName type user createdDate')   
    .populate('user','address phone email status userType')
    .sort({ createdDate: -1 })
    .exec()
    .then(docs =>{
        res.status(200).json(docs); 
    })
    .catch(err =>{
      
        res.status(500).json({
            error:err
        });
    });
});

router.get('/getsupplyitem/:supplierId',(req,res,next) => {   

    const id = req.params.supplierId;  
     
    SupplyItems.find({      
        supplier:id 
    })
    // .select('categoryName categoryImage  createdDate')   
     .populate('categories')
    .exec()
    .then(docs =>{      
         res.status(200).json(docs)
    })
    .catch(err =>{     
        res.status(500).json({
            error:err
        });
    });
});

router.get('/getfrequentorders/:kitchenId', (req, res, next) => {
  
    const id = req.params.kitchenId;
    let data = {}
    Order.find({
            "kitchen": id
        })
        .populate('order')
        .populate('supplier', 'companyName')
        //.populate('kitchen')
        .exec()
        .then(docs => {
          
           // res.status(200).json(docs);
           data = docs 
        })
        .then(abc => {  
            let ids = [];
            var duplicates ;
            for (let i = 0; i <= data.length -1; i++) {             
                ids.push({
                    orderId:data[i]._id
                })
            }
            let searchids =[]
            ids.forEach(element => {
                searchids.push(element.orderId)
               
            });
      
            if(ids.length > 0){
            OrderDetail.find({order:searchids}).then(result => { 
                // console.log('-------------------------------------------')
                // console.log('result',result);
                // console.log('-------------------------------------------')

                const uniq = new Set(result.map(e => JSON.stringify(e.product)));
                const ress = Array.from(uniq).map(e => JSON.parse(e));
                Products.find({_id:ress})
                .populate('categories','categoryName')
                .then(response => { 
                                        const result = [];
                    const map = new Map();
                    for (const item of response) {
                        if(!map.has(item.categories._id)){
                            map.set(item.categories._id, true);    // set any value to Map
                            result.push({
                                id: item.categories._id,
                                name: item.categories.categoryName
                            });
                        }
                    }        
                  res.status(200).json({
                      products:response,
                     category:                        
                         result,
                     
                    });
                })
            })
        }
        else
        {
            res.status(200).json(data)
        }
        })
        .catch(err => {
         
            res.status(500).json({
                error: err
            });
        });
});

//Get All date using Get request from  Supplier Collection
router.get('/getsuppliers',(req,res,next) =>{
    Supplier.find({}) 
    .sort({ createdDate: -1 })
    .select('companyName trnNumber supplyItem  user createdDate')   
    .populate('user','address phone email status userType')
    .exec()
    .then(docs =>{
        res.status(200).json(docs); 
    })
    .catch(err =>{
      
        res.status(500).json({
            error:err
        });
    });
});
router.post('/kitchensignup',(req,res,next) => {  
 
let _status =false;

    const date = new Date;  
    User.find({email:req.body.user.email})    
    .exec()
    .then(user =>{ 
       if(user.length >= 1)
        {  
                  
            return res.status(200).json({
                message:'Your email already exists, please sign in'
            })
       }
       else
        {
            bcrypt.hash(req.body.user.password,null,null,(err,hash) =>{
                if(err)
                {
                    return res.status(500).json({
                        error:err
                    })
                }
                else
                {
                    if(req.body.user.createdBy =="admin")
                    {

                        _status = true
                        const user = new User({
                            _id:mongoose.Types.ObjectId(),
                            email:req.body.user.email,
                            password:hash,
                           address:req.body.user.address,
                           phone:req.body.user.phone,
                            userType:req.body.user.userType,                       
                           status:_status,
                           createdDate:date.toString(),
                           updateDate:date.toString(),
                        });
                        user.save()
                        .then(result =>{   
    
                            if(result.userType =="kitchen")
                            { 
                                sendEmailUser(req.body.user.email)
                            // sendEmail('ww.abdurrehman@gmail.com');                                              
                                const kitchen = new Kitchen({
                                    _id:mongoose.Types.ObjectId(),
                                   kitchenName:req.body.kitchen.kitchenName,
                                   type:req.body.kitchen.type,
                                    user:result._id,
                                    createdDate:date.toString(),
                                    updateDate:date.toString(),
                                });
                                kitchen.save()
                                .then(docs =>{  
    
                                    res.status(201).json({
                                        kitchencreated:docs,
                                        message:"You have successfully created the kitchen"
                                    })
                                })
                                .catch(err =>{                                 
                                    res.status(500).json({
                                        error:err
                                    })
                                });
                            }                   
                        })
                        .catch(err =>{                          
                            res.status(500).json({
                                error:err
                            })
                        })
                    }
                    else
                    {
                        const user = new User({
                            _id:mongoose.Types.ObjectId(),
                            email:req.body.user.email,
                            password:hash,
                           address:req.body.user.address,
                           phone:req.body.user.address,
                            userType:req.body.user.userType,                       
                           status:_status,
                           createdDate:date.toString(),
                           updateDate:date.toString(),
                        });
                        user.save()
                        .then(result =>{   
    
                            if(result.userType =="kitchen")
                            { 
                                sendEmail(req.body.user.email);                        
                                const kitchen = new Kitchen({
                                    _id:mongoose.Types.ObjectId(),
                                   kitchenName:req.body.kitchen.kitchenName,
                                   type:req.body.kitchen.type,
                                    user:result._id,
                                    createdDate:date.toString(),
                                    updateDate:date.toString(),
                                });
                                kitchen.save()
                                .then(docs =>{  
    
                                    res.status(201).json({
                                        kitchencreated:docs,
                                        message:"Congratulations! You have successfully signed up for the kitchen"

                                    })
                                      sendEmail(req.body.user.email);    
                                })
                                .catch(err =>{                                 
                                    res.status(500).json({
                                        error:err
                                    })
                                });
                            }                   
                        })
                        .catch(err =>{                           
                            res.status(500).json({
                                error:err

                            })
                        })

                    }                  
           
                }
            })

        }
    })
   
    });

//Post Request To Add Kitchen data in collection
router.post('/signup',(req,res,next) => {  
 console.log(req.body)
  const date = new Date;  
    User.find({email:req.body.user.email})    
    .exec()
    .then(user =>{ 
       if(user.length >= 1)
        {  
                  
            return res.status(200).json({
                message:'Your email already exists, you can sign in with this email'
            })
       }
       else
        {
            bcrypt.hash(req.body.user.password,null,null,(err,hash) =>{
                if(err)
                {
                    return res.status(500).json({
                        error:err,                      

                    })
                }
                else
                {
                    
                    if(req.body.supplier.createdBy =="admin")
                    { 
                    const user = new User({
                        _id:mongoose.Types.ObjectId(),
                        email:req.body.user.email,
                        password:hash,
                        phone:req.body.phone,
                        address:req.body.user.address,
                        phone:req.body.user.phone,
                        userType:req.body.user.userType,                       
                        status:true,
                        createdDate:date.toString(),
                        updateDate:date.toString(),
                    });
                    user.save()
                    .then(result =>{   

                        if(result.userType =="supplier")
                        {
                            const supplier = new Supplier({
                                _id:mongoose.Types.ObjectId(),
                                fullName:req.body.supplier.fullName,
                                companyName:req.body.supplier.companyName,
                                trnNumber:req.body.supplier.trnNumber,                              
                                createdDate:date.toString(),
                                updateDate:date.toString(),
                                user:result._id,

                            });
                            supplier.save()
                            .then(docs =>{   
                                req.body.supplyItem.forEach(element => {                                  
                                      const supplyItems1 = new SupplyItems({
                                        _id: mongoose.Types.ObjectId(),
                                        categories:element.categoryId,
                                        supplier : docs._id,
                                        createdDate: date.toString(),
                                        updatedDate: date.toString()
                    
                                    });
                                    supplyItems1.save()
                                    .then(data =>{
                                     
                                    })                                  
                               });                              
                                res.status(201).json({
                                  
                                    message:"Congratulations! You have successfully signed up for the supplier portal"
                                })   
                               sendEmailUser(req.body.user.email)  
                            })                           
                            .catch(err =>{
                             
                                res.status(500).json({
                                    error:err
                                })
                            });
                        }
                    })
                    .catch(err =>{
                       
                        res.status(500).json({
                            error:err
                        })
                    })
                }
                else
                {
                  
                    const user = new User({
                        _id:mongoose.Types.ObjectId(),
                        email:req.body.user.email,
                        password:hash,
                        phone:req.body.phone,
                        address:req.body.user.address,
                        phone:req.body.user.phone,
                        userType:req.body.user.userType,                       
                        status:false,
                        createdDate:date.toString(),
                        updateDate:date.toString(),
                    });
                    user.save()
                    .then(result =>{   

                        if(result.userType =="supplier")
                        {
                            
                            // sendEmail('ww.abdurrehman@gmail.com'); 
                            const supplier = new Supplier({
                                _id:mongoose.Types.ObjectId(),
                                fullName:req.body.supplier.fullName,
                                companyName:req.body.supplier.companyName,
                                trnNumber:req.body.supplier.trnNumber,
                                // supplyItem:req.body.supplier.supplyItem,
                                createdDate:date.toString(),
                                updateDate:date.toString(),
                                user:result._id,

                            });
                            supplier.save()
                            .then(docs =>{
                                req.body.supplyItem.forEach(element => {                                  
                                    const supplyItems1 = new SupplyItems({
                                      _id: mongoose.Types.ObjectId(),
                                      categories:element.categoryId,
                                      supplier : docs._id,
                                      createdDate: date.toString(),
                                      updatedDate: date.toString()
                  
                                  });
                                  supplyItems1.save()
                                  .then(data =>{                                    
                                  })                                  
                             });                              
                              res.status(201).json({
                                
                                  message:"Congratulations! You have successfully signed up for the supplier portal"
                              })   
                             sendEmailUser(req.body.user.email)  
                          }) 
                            .catch(err =>{                             
                                res.status(500).json({
                                    error:err
                                })
                            });
                        }
                    })
                    .catch(err =>{                      
                        res.status(500).json({
                            error:err
                        })
                    })

                } 
            }
            })

        }
    })

    

});

// Get Supplier Data from supplier collection based on id
router.get('/getsupplierbyid/:supplierId',(req,res,next) =>{   
    const id = req.params.supplierId
    Supplier.find({_id:id})
    .sort([['createdDate', -1]])
    .select('companyName trnNumber supplyItem fullName phone')   
    .populate('user','email address')
    .exec()
    .then(doc =>{
       if(doc)
       {
           
           SupplyItems.find({supplier:id})
           .populate('categories')
           .then(data =>{
            let supplyItem_array =[];
            let sup ;
            for (let j = 0; j < data.length; j++) {              
             let supplyItem ={
                _id:data[j].categories._id,
                  categoryName:data[j].categories.categoryName,
            };
            // supplyItem1 = supplyItem[j] 
            supplyItem_array.push(supplyItem);  
            }
          console.log(supplyItem_array)
            for (let i = 0; i < doc.length; i++) {  
                if (doc[i].fullName == null) {
                    doc[i].fullName ="";
                }          
               sup ={
                  _id:doc[i]._id,
                  companyName:doc[i].companyName,
                  trnNumber:doc[i].trnNumber,
                  email:doc[i].user.email,
                  address:doc[i].user.address,                 
                  fullName:doc[i].fullName,
              };
            //   sup_array.push(sup);
            
            }
            // console.log(sup)
            //  var ob = sup.concat(supplyItem);
                res.status(200).json({
                    supplyItems:supplyItem_array,
                    user:sup
                });
           })
           
       
       }
       else
       {
           res.status(404).json({
               message:"no valid entry found against this id"
           });
       }
    })
    .catch(err =>{
     
        res.status(500).json({})
    });
    });

// Get kitchen Data from kitchen collection based on id
    router.get('/getkitchenbyid/:kitchenId',checkAuth,(req,res,next) =>{
       const id = req.params.kitchenId
       Kitchen.findById(id)
       .sort([['createdDate', -1]])
       .select('kitchenName type user')   
       .populate('user','address phone email status')
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
           res.status(500).json({})
       });
    });

    //update Kitchen Data against KitchenId
    router.patch('/updatekitchen/:kitchenId',checkAuth,(req,res,next) =>{       
        const id = req.params.kitchenId;        
        const updatedDate = new Date; 
        if (req.body.user.updatedBy =="admin") 
        {
      Kitchen.update({_id:id},{$set:{
          kitchenName:req.body.kitchen.kitchenName,
          type:req.body.kitchen.type,         
          updateDate:updatedDate.toString(),       
        }})
      .exec()
      .then(result =>{
        Kitchen.findById(id)
        .select('user')
        .exec()
        .then(docs =>{            
            User.update({_id:docs.user},{$set:{
                status:req.body.user.status,
                phone:req.body.user.phone,
                address:req.body.user.address

            }})
            .exec()
            .then(rst =>{              
                sendEmailUser(req.body.user.email)
                res.status(200).json(rst);
            })
        })
        .catch(
            err =>{               
                res.status(500).json({
                    error:err
                });
            });        
          res.status(200).json(
              {
                  result:result,
                 message:"Kitchen updated successfully" 
            });
      })
      .catch(err =>{       
          res.status(500).json({
              error:err,
              message:'there is an error on updating a kitchen'
          });
      })
    }
    else
    {
        bcrypt.hash(req.body.user.password,null,null,(err,hash) =>{

            if(err)
            {
                return res.status(500).json({
                    error:err,                      

                })
            }
            else
            {
                Kitchen.update({_id:id},{$set:{
                    kitchenName:req.body.kitchen.kitchenName,
                    type:req.body.kitchen.type,         
                    updateDate:updatedDate.toString(),       
                  }})
                .exec()
                .then(result =>{
                  Kitchen.findById(id)
                  .select('user')
                  .exec()
                  .then(docs =>{           
                      User.update({_id:docs.user},{$set:{
                          //status:req.body.user.status,
                          phone:req.body.user.phone,
                          address:req.body.user.address,
                          password:hash
          
                      }})
                      .exec()
                      .then(rst =>{                       
                          res.status(200).json(rst);
                      })
                  })
                  .catch(
                      err =>{                      
                          res.status(500).json({
                              error:err
                          });
                      });
                    console.log(result);
                    res.status(200).json( {
                        result:result,
                       message:"Kitchen updated successfully" 
                  });
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        error:err,
                      message:'there is an error on updating a kitchen'
        
                    });
                })
            } 
        })        
     
    }
    });

     //update Supplier Data against KitchenId
     router.patch('/updatesupplier/:supplierId',checkAuth,(req,res,next) =>{  
         
         console.log(req.body)
        const id = req.params.supplierId;
        const date = new Date;           
        const updatedDate = new Date;   
        if (req.body.user.updatedBy =="admin") 
        {
           
            Supplier.update({_id:id},{$set:{
                fullName:req.body.supplier.fullName,
                companyName:req.body.supplier.companyName,
                supplyItem:req.body.supplier.supplyItem,
                trnNumber:req.body.supplier.trnNumber,                
                  updateDate:updatedDate.toString(),       
                }})
              .exec()
              .then(result =>{
                Supplier.findById(id)
                .select('user')
                .exec()
                .then(docs =>{          
                   // console.log('doooccccsss'+docs); 
                    User.update({_id:docs.user},{$set:{
                        status:req.body.user.status,
                        phone:req.body.user.phone,
                        address:req.body.user.address
        
                    }})
                    .exec()
                    .then(rst =>{
                        sendEmailUser(req.body.user.email)
                        console.log('rst',rst);
                        res.status(200).json(rst);
                    })
                })
                .then(abc =>{
                    // SupplyItems.remove({supplier:id})
                    // .exec()
                    // .then(result =>{
                    //   console.log('result',result)
                    //   console.log('=========================')
                    //     console.log(req.body.supplyItem.newSupplyItem)
                    //     console.log('=========================')
                    if(req.body.supplyItem.newSupplyItem.length > 0)
                    {

                        req.body.supplyItem.newSupplyItem.forEach(element =>{
                            const supItems = new SupplyItems({
                                          _id: mongoose.Types.ObjectId(),
                                          categories:element.categoryId,
                                          supplier : id,
                                          createdDate: date.toString(),
                                          updatedDate: date.toString()
                      
                                      });
                                      supItems.save()
                                      .then(data =>{
                                          console.log(data)
                                      })
                        })
                     
                    }
                    // console.log('=========================')
                    // console.log(req.body.supplyItem.oldSupplyItem)
                    // console.log('=========================')
                    if(req.body.supplyItem.oldSupplyItem.length > 0)
                    {
                      
                        let delIds = []
                        req.body.supplyItem.oldSupplyItem.forEach(element =>{
                          
                            delIds.push(element.categoryId)
                        })
                        // let tempdata = {
                        //     categories: {
                        //         $in: delIds.toString().split(',')
                        //     }                            
                        // }
                        // console.log('=========================')
                        // console.log(tempdata)
                        // console.log('=========================')
                        SupplyItems.deleteMany({categories:delIds})
                        .exec()
                        .then(result =>{
                            console.log(result);
                        })
                    }
                })
                .catch(
                    err =>{
                        console.log(err);
                        res.status(500).json({
                            error:err
                        });
                    });
                  console.log(result);
                  res.status(200).json( {
                    result:result,
                   message:"Supplier updated successfully" 
              });
              })
              .catch(err =>{
                  console.log(err);
                  res.status(500).json({
                      error:err,
              message:'There is an error on updating a supplier'

                  });
              })
             
         }
         else
         {
      Supplier.update({_id:id},{$set:{
        fullName:req.body.supplier.fullName,
        companyName:req.body.supplier.companyName,
        supplyItem:req.body.supplier.supplyItem,
        trnNumber:req.body.supplier.trnNumber,                
          updateDate:updatedDate.toString(),       
        }})
      .exec()
      .then(result =>{
        Supplier.findById(id)
        .select('user')
        .exec()
        .then(docs =>{           
            User.update({_id:docs.user},{$set:{
               // status:req.body.user.status,
                phone:req.body.user.phone,
                address:req.body.user.address

            }})
            .exec()
            .then(rst =>{
                console.log('rst',rst);              
                    // console.log('==========================================')
                    //    console.log('supplyItem',req.body.supplyItem.newSupplyItem)
                    //    console.log('========================================================')
               if(req.body.supplyItem.newSupplyItem.length > 0)
               {

                   req.body.supplyItem.newSupplyItem.forEach(element =>{
                       const supItems = new SupplyItems({
                                     _id: mongoose.Types.ObjectId(),
                                     categories:element.categoryId,
                                     supplier : id,
                                     createdDate: date.toString(),
                                     updatedDate: date.toString()
                 
                                 });
                                 supItems.save()
                                 .then(data =>{
                                     console.log(data)
                                 })
                   })
                
               }
            //    console.log('=========================')
            //    console.log(req.body.supplyItem.oldSupplyItem)
            //    console.log('=========================')
               if(req.body.supplyItem.oldSupplyItem.length > 0)
               {
                   let delIds = []
                   req.body.supplyItem.oldSupplyItem.forEach(element =>{
                     
                       delIds.push(element.categoryId)
                   })
                   SupplyItems.deleteMany({categories:delIds})
                   .exec()
                   .then(result =>{
                       console.log(result);
                   })
               }         
                // res.status(200).json(rst);
            })
           
        })
        // .then(pqr =>{
        //     for (let i = 0; i < req.body.supplyItem.length; i++)
        //     {
        //        SupplyItems.update({
        //            supplier: id
        //        }, {
        //            $set: {
        //                categories:req.body.supplyItem[i].categoryId,
        //                updateDate: updatedDate.toString(),
        //            }
        //        })

        //        .then(result => {

        //        })
        //     }
        // })
        .catch(
            err =>{
                console.log(err);
                res.status(500).json({
                    error:err
                });
            });
          console.log(result);
          res.status(200).json( {
            result:result,
           message:"Supplier updated successfully" 
      });
      })
      .catch(err =>{
          console.log(err);
          res.status(500).json({
              error:err,
              message:'There is an error on updating a supplier'

          });
      })
    }
    });

    //Delete data from kitchen collection against kitchen id
    router.delete('/deletekitchen/:kitchenId',checkAuth,(req,res,next) =>{
       
        const id =req.params.kitchenId;
        Kitchen.findById(id)
       // .select('user address phone status')
        .exec()
        .then(docs =>{                
            User.remove({_id:docs.user})          
            .then(result =>{
               console.log(id);
               
              Kitchen.remove({_id:id})              
              .then(result =>{
                return res.status(200).json( {
                    result:result,
                   message:"Kitchen deleted " 
              })

              })
            })

            })
          
            .then(rst =>{
                console.log('rst',rst);
                // res.status(200).json(rst);
            })
            .catch(
                err =>{
                    console.log(err);
                    res.status(500).json({
                        error:err,
                        message:'There is an error on deleting kitchen '
                    });
                });
     });

     //login kitchen and supplier
     router.post('/login',(req,res,next) =>{
     
         User.find({email:req.body.email,status:'true'})
         .exec()
         .then(users =>{          
             if(users.length < 1)
             {
                 return res.status(200).json({
                     message:"The email provided does not exist"
                 })
             }  

             bcrypt.compare(req.body.password,users[0].password,(err,result) =>{
                 if(err)
                 {                    
                    return res.status(200).json({
                        message:'Your password seems incorrect'
                    });
                 }
                 if(result)
                 {
                    Supplier.find({user:users[0]._id})
                    .exec()
                    .then(sup =>{
                        var catids =[];
                   //    console.log(supplierID)                
                  SupplyItems.find({supplier:sup[0]._id})
                  .then(elementsupitem =>{
                 

                    elementsupitem.forEach(element => {
                        console.log('categoryid',element.categories)
                        catids.push(element.categories);
                     });
                     res.status(200).json({
                        message:'You have logged in successfully',
                        isAuthenticated:true,
                        userId:users[0]._id,
                        supplierId: sup[0]._id,                        
                        token:token, 
                        categories:catids                     
                       
                    });  
                  })
            
                    }) 
                    .catch(errr =>{
                       res.status(500).json({
                           error:errr
                       });
                   }); 
                   
                       token = jwt.sign({
                         email:users[0].email,
                         userId:users[0]._id,
                         userTypes:users[0].userType
                     },
                    "secret",
                     {
                         expiresIn:"1day"

                     }
                     )  
                     const date = new Date;
                    // getSupplier(token,users,res,req,next);                 
                  
                   
                     const addSession = Sessions({
                      _id:mongoose.Types.ObjectId(),
                      securityToken:token,
                      createdDate:date.toString(),
                      user:users[0]._id,
                      isActive:true,
                      deActiveTime:null,
                     });
                     addSession.save()
                     .then(docs =>{
                        // console.log('sdfsdfjkhskf'+docs);
                        //  res.status(201).json({
                        //      sessionCreated:docs
                        //  });
                     })
                     .catch(errr =>{
                         res.status(500).json({
                             error:errr
                         });
                     }); 
                    
                               
                 }else{
                     res.status(200).json({
                        isAuthenticated:false,
                        message:'Email or password provided seems incorrect'
                    });
                 }
             });
         })
         .catch(err =>{
            console.log(err);
            res.status(500).json({
                error:err
            });
                }) ;
    });
    router.post('/kitchenlogin',(req,res,next) =>{
        console.log(req.body)
          User.find({email:req.body.email,status:'true'})
          .exec()
          .then(users =>{             
              if(users.length < 1)
              {
                  return res.status(200).json({
                      message:"The email provided does not exist"
                  })
              }
              bcrypt.compare(req.body.password,users[0].password,(err,result) =>{
                  if(err)
                  {                    
                     return res.status(401).json({
                         message:'Your password seems incorrect'
                     });
                  }
                  if(result)
                  {
                    
                        token = jwt.sign({
                          email:users[0].email,
                          userId:users[0]._id,
                          userTypes:users[0].userType
                      },
                     "secret",
                      {
                          expiresIn:"1day"
 
                      }
                      )  
                      const date = new Date;
                    // getSupplier(token,users,res,req,next);                 
                      Kitchen.find({user:users[0]._id})
                              .exec()
                              .then(kit =>{
                              
                             //    console.log(supplierID)
                            console.log(kit)
                      res.status(200).json({
                         isAuthenticated:true,
                          message:'You have logged in successfully',
                          userId:users[0]._id,
                          kitchenId:kit[0]._id,                        
                          token:token,                      
                         
                      });  
                              }) 
                              .catch(errr =>{
                                 res.status(500).json({
                                     error:errr
                                 });
                             }); 
                    
                      const addSession = Sessions({
                       _id:mongoose.Types.ObjectId(),
                       securityToken:token,
                       createdDate:date.toString(),
                       user:users[0]._id,
                       isActive:true,
                       deActiveTime:null,
                      });
                      addSession.save()
                      .then(docs =>{
                         // console.log('sdfsdfjkhskf'+docs);
                         //  res.status(201).json({
                         //      sessionCreated:docs
                         //  });
                      })
                      .catch(errr =>{
                          res.status(500).json({
                              error:errr
                          });
                      }); 
                     
                                
                  }else{
                      res.status(200).json({
                         isAuthenticated:false,
                         message:'Email or password provided seems incorrect'
                     });
                  }
              });
          })
          .catch(err =>{
             console.log(err);
             res.status(500).json({
                 error:err
             });
                 }) ;
     });

    //logout a user
    router.patch('/logout/:userId',(req,res,next) =>{
        const id = req.params.userId;
        console.log(req);
        const updatedDate = new Date;
      Sessions.update({_id:id},{$set:{
        securityToken:null,
        isActive:false,      
        deActiveTime:updatedDate.toString(),
      
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
    
     //Delete data from supplier collection against supplier id
    router.delete('/deletesuppliers/:supplierId',checkAuth,(req,res,next) =>{
        const id =req.params.supplierId;
        Supplier.findById(id)
       // .select('user address phone status')
        .exec()
        .then(docs =>{
            console.log('-------------------------');   
            console.log('docs',docs); 
            console.log('-------------------------');              
            User.remove({_id:docs.user})          
            .then(result =>{
               console.log(id);
               
              Supplier.remove({_id:id})              
              .then(result =>{
              })
              .then(abc =>{
                  SupplyItems.remove({supplier:id})
                  return res.status(200).json( {
                    result:result,
                   message:"You have successfully deleted the supplier" 
              })
              })
            })

            })
          
            .then(rst =>{
               
                // res.status(200).json(rst);
            })
            .catch(
                err =>{
                    console.log(err);
                    res.status(500).json({
                        error:err,
                        message:'There is an error on deleting supplier '

                    });
                });
        })

      //update Supplier Data against supplierID
    router.patch('updatesupplier/:userId',checkAuth,(req,res,next) =>{
           const id = req.params.userId;
           Supplier.update({_id:id},{$set:{
                    address:req.body.address,
                    phone:req.body.phone, 
                    updateDate:updatedDate.toString(),       
                    }})
                    .exec()
                    .then(
                        result =>{
                            console.log(result);
                            Supplier.update({_id:req.body.supplierId},{$set:{
                                    companyName:req.body.companyName,
                                    trnNumber:req.body.trnNumber,       
                                    supplyItem:req.body.supplyItem,
                                    updateDate:updatedDate.toString(),       
                                    }})
                              
                        })
                        .then(us =>{
                            res.status(200).json(us);
                        })
                        .catch(err =>{
                                  console.log(err);
                                  res.status(500).json({
                                      error:err
                                  });
                              })  
    });

     //function to send emails 
      function sendEmail(email)
{
   
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'ww.abdurrehman92@gmail.com',
          pass: 'Gmail_!@#$%6'
        }
      });
      var mailOptions = {       
        to: 'ww.abdurrehman@gmail.com',
        subject: 'User Authantication',
        text: "Dear admin the "+ email + " want to signup your site"
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
       }

         //function to send emails 
      function sendEmailUser(email)
      {
          console.log(email)
          var transporter = nodemailer.createTransport({
              service: 'gmail',
              host: 'smtp.ethereal.email',
              port: 587,
              secure: false, // true for 465, false for other ports
              auth: {
                user: 'ww.abdurrehman92@gmail.com',
                pass: 'Gmail_!@#$%6'
              }
            });
            var mailOptions = {       
              to: email,
              subject: 'Account approved',
              text: "Dear "+ email + ",your account has been approved successfully"
            };
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
             }

  
    module.exports =router;
    


    