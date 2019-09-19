const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');;
const bcrypt = require('bcrypt-nodejs');
const User = require('../../env/user.model');
const Supplier = require('../../env/Supplier.model');
const Sessions = require('../../env/session.model');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/auth-check')
const Orders = require('../../env/orders.model');
const OrderDetails = require('../../env/order-details.model');
const OrderStatus = require('../../env/order-status.model');
const OrderDetailSupplier = require('../../env/order-detail-supplier.model');
const OrderAcceptance = require('../../env/order-fulfilment.model');

const Kitchen = require('../../env/kitchens.model');


router.post('/login',(req,res,next) =>{
  
      User.find({email:req.body.email,userType:"admin"})
      .exec()
      .then(users =>{     
             if(users.length < 1)
          {
              return res.status(401).json({
                  message:'The email provided does not exist'
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
                  Supplier.find({user:users[0]._id})
                          .exec()
                          .then(admn =>{
                  res.status(200).json({
                      message:'You have logged in successfullyl',
                      userId:users[0]._id,
                      adminId: admn[0]._id,                        
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
                    
                  })
                  .catch(errr =>{
                      res.status(500).json({
                          error:errr
                      });
                  }); 
                 
                            
              }else{
                  res.status(401).json({
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
        });
          
    });
    router.get('/charttotalorders',(req,res,next) =>{
        var total;
        var fulfil ;
        var pending ;
       Orders.count({})
       .exec()
       .then(cnt =>{
           total =cnt;
        
         // return res.status(200).json(cnt);
       }).then(cnt =>{
        Orders.count({
            "status":"Fulfil"
        })
        .exec()
        .then(ful =>{
            fulfil =ful;
          
        }) 
       })
       .then(cnt =>{
        Orders.count({
            "status":"Pending"
        })
        .exec()
        .then(pen =>{
            pending= pen;           
        })
       })
       .then(cnt =>{         
       OrderStatus.count({
           "status":"Cancel"
       })
       .then(can =>{       
           res.status(200).json({
               total:total,
               fulfil:fulfil,
               pending:pending,
               cancel:can
           })
       }       
       )
       })
       .catch(errr =>{
        res.status(500).json({
            error:errr
        });
    });
    })
    //Get OpenOrders
router.get('/getopenorders', (req, res, next) => {
    let data ={};
    Orders.find({
     // status:'Ready For QA'
        })
        .exec()
        .then(docs => {
            data = docs;
            res.status(200).json(docs)
            // res.status(200).json(
            //     {
            //         docs:docs,
            //         complete:"complete",
            //     }
            // );
        })
        // .then(docs =>{
        //    console.log(data);
        //     OrderDetails.find({
        //         supplier: { $ne: null },
        //         orderDetailStatus:'Ready For QA'

        //          })
        //          .exec()
        //          .then(data => {
        //              res.status(200).json(
        //                  {
        //                      docs:data,                             
        //                      complete:"Partial",
        //                  }
        //              );
        //          })
        // })
        // .catch(err => {
        //     console.log(err);
        //     res.status(500).json({
        //         error: err
        //     });
        // });
});
    router.get('/charttotalincome',(req,res,next) =>{
      Orders.aggregate([{
          $group:{
            _id:null ,
            totalincome:{$sum:"$totalPrice"}
          }
      }])
      .exec()
      .then(inc =>{
          console.log(inc)
          res.status(200).json({
              income:inc[0].totalincome +  ' AED'
          })
      })
      .catch(errr =>{
        res.status(500).json({
            error:errr
        });
    });
      
     })
     router.get('/charttotalincomemonth',(req,res,next) =>{
       var data ={};
        const monthNames = ["Jan", "Feb", "Mar", "April", "May", "June",
        "July", "Aug", "Sep", "Oct", "No", "Dec"
      ];
        const d = new Date();
        d.getMonth();       
        // console.log(d.getMonth());
        Orders.aggregate([{         
           
                $match: {
                   status: 'Fulfil',
                    // createdDate:'2019-08-21T07:29:44.005Z'
                    createdDate:{$regex:'.*'+ monthNames[d.getMonth()] +'.*'}

                }
            },
            {
            $group:{
              _id:null ,
              totalincome:{$sum:"$totalPrice"}
            }
        },
           
        ])
        .exec()
        .then(inc =>{
            data =inc;
            Orders.aggregate([{         
           
                $match: {
                    status: 'Fulfil',
                    // createdDate:'2019-08-21T07:29:44.005Z'
                    createdDate:{$regex:'.*'+ monthNames[d.getMonth()] +'.*'}

                }
            },
            {
            $group:{
              _id:null ,
              totalincome:{$sum:"$totalPrice"}
            }
        },
           
        ])
        .exec()
        .then(lastin =>{
             if (lastin.length > 0 && data > 0) {
                res.status(200).json({
                thismonth:data[0].totalincome,
                lastmonth:lastin[0].totalincome
            }) 
        
             }
             else if (data <= 0 && lastin <= 0) {
                res.status(200).json({
                    thismonth:0,
                    lastmonth:0
                }) 
            }
            else if (data <= 0 && lastin > 0) {
                res.status(200).json({
                    thismonth:0,
                    lastmonth:lastin[0].totalincome
                }) 
            }
             else
             {
                res.status(200).json({
                    thismonth:data[0].totalincome,
                    lastmonth:0
                })  
             }
        }      
        )
        })
        .catch(errr =>{
          res.status(500).json({
              error:errr
          });
      });
        
       })

       router.get('/getorders', (req, res, next) => {           
        Orders.find({
                //  "isActive": ture
            })
            .populate('kitchen', 'kitchenName')
            .populate('supplier', 'companyName')
            .exec()
            .then(docs => {
                // console.log(docs)
                res.status(200).json(docs);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    });

    router.get('/orderdetailsummary/:orderId', (req, res, next) => {
        
        OrderDetails.find({
                "order": req.params.orderId,                
            })
            .populate('product')
            .populate('order')
            .exec()
            .then(docs => {
                res.status(200).json(docs);
            })
    });
    router.get('/subpartialorder/:orderDetailId', (req, res, next) => {
        
        OrderDetailSupplier.find({
                "orderDetail": req.params.orderDetailId,                
            })
            .populate('product')
            .populate('orderdetails')
            .exec()
            .then(docs => {
                res.status(200).json(docs);
            })    
    
    });

    router.patch('/updatecompleteorder/:orderId', (req, res, next) => {
         
        const id = req.params.orderId;
        if(req.body.status =="Delivered"){

       
        const updatedDate = new Date;
        Orders.update({
                _id: id
            }, {
                $set: {
                    status: req.body.status, 
                    deleviryDate: updatedDate.toString(),                   
                    // orderRefrence:"SUP-324A2b234",
                    updateDate: updatedDate.toString(),
                }
            })
            .exec()
            .then(result => {
               
                res.status(200).json(result);
            })
            .catch(err => {               
                res.status(500).json({
                    error: err
                });
            })
        }
        else
        {
            const updatedDate = new Date;
            Orders.update({
                    _id: id
                }, {
                    $set: {
                        status: req.body.status, 
                       // deleviryDate: req.body.deleviryDate,                   
                        // orderRefrence:"SUP-324A2b234",
                        updateDate: updatedDate.toString(),
                    }
                })
                .exec()
                .then(result => {
                   
                    res.status(200).json(result);
                })
                .catch(err => {               
                    res.status(500).json({
                        error: err
                    });
                })
        }
    });
    router.patch('/updatepartialcompleteorder/:orderDetailId',(req, res, next) => {

        const id = req.params.orderDetailId;
        const updatedDate = new Date;
        OrderDetails.update({
                _id: id
            }, {
                $set: {
                    orderDetailStatus: req.body.status,                   
                    // orderRefrence:"SUP-324A2b234",
                    updateDate: updatedDate.toString(),
                }
            })
            .exec()
            .then(result => {
               
                res.status(200).json(result);
            })
            .catch(err => {               
                res.status(500).json({
                    error: err
                });
            })
    });
    router.patch('/updatesubpartialorder/:orderDetailSupplierId', (req, res, next) => {

        const id = req.params.orderDetailSupplierId;
        const updatedDate = new Date;
        OrderDetails.update({
                _id: id
            }, {
                $set: {
                    orderDetailStatus: req.body.status,                   
                    // orderRefrence:"SUP-324A2b234",
                    updateDate: updatedDate.toString(),
                }
            })
            .exec()
            .then(result => {
               
                res.status(200).json(result);
            })
            .catch(err => {               
                res.status(500).json({
                    error: err
                });
            })
    });
       //logout a admin
       router.patch('/logout/:userId',(req,res,next) =>{
        const id = req.params.userId;
       
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
    router.get('/totalkitchens',(req,res,next) =>{
       
       Kitchen.count({})
       .exec()
       .then(cnt =>{
           res.status(200).json(cnt)
       })
    });
    router.get('/getinprogressorders', (req, res, next) => {
        // const id = req.params.supplierId  
        OrderAcceptance.aggregate([
                {
                    $match: {
                        $and: [{
                            $or: [{
                                status: "Cancelled" 
                            }, {
                                status: "QA In Progress"
                            }, {
                                status: "On the way"
                            }, {
                                status: "Delivered"
                            }]
                        }],
                        //  "isActive": true
                    }
                },
                {
                    $lookup: {
                        from: 'orders',
                        localField: 'order',
                        foreignField: '_id',
                        as: 'od'
                    }
     
                },
                {
                    $group: {
                        _id: {
                            referenceNumber: "$referenceNumber",
                            status: "$status",
                            "order": "$order",
                            "partialType":"$partialType",
                              "order":"$od",
                              "supplier":"$supplier"
                        },
                        orderSize: {
                            $sum: 1
                        }
                    }
                }
            ])
            .then(ordr => {
                console.log(ordr)
                res.status(200).json(ordr)
            })
    });
    router.patch('/updatestatusbysup/:orderId', (req, res, next) => {
        console.log(req.body)
         const id = req.params.orderId
        console.log(req.params.orderId)
        const updatedDate = new Date;  
        OrderAcceptance.update({
            'supplier':req.body.supplierId,
            'order':id
        },
        {
            $set:{
                status:req.body.status,
                updateDate: updatedDate.toString(),
            }
        },
        {
            multi: true
        }
        )
        .exec()
            .then(result => {
                console.log('result', result);
            //   Order.update({
            //     _id: id
            // }, {
            //     $set: {
            //         status: req.body.status,           
            //         updateDate: updatedDate.toString(),
            //     }
                
            // })
            // .exec()
            // .then(data => {
    
            // })
            res.status(200).json({
                data:result,
                message:'updated successfully'
            })
            })
    })
    router.patch('/cancelorder/:orderId',  (req, res, next) => {
        console.log('bsdasdkajhdasd'+JSON.stringify( req.body));
        const date = new Date;
        OrderAcceptance.find({
            order:req.params.orderId,
            supplier:req.body.supplierId
        })
        .populate('orderDetail')
        .then(data =>{     
          if(data[0].partialType =="Complete")
          {
            
            //   let quan =[];
              OrderDetail.find({"order":req.params.orderId}).then(dd =>{         
              dd.forEach(element =>{
               
                  OrderDetail.updateMany({
                    "order":req.params.orderId
                },{$set:{
                 remainingQuantity:element.orderQuantity
                }},{
                    multi:true
                })
                .exec()
                .then(result =>{
                    console.log(result);           
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        error:err,
                     message:"An error occurred while cancelling an order, can you please try again" 
              
                    });
                })
              })
              })
              Order.update({_id:req.params.orderId},{$set:{
                  status:"Pending",
                  updateDate:data.toString()
              }})
              .then(abc =>{
                  console.log(abc);
              })
          }
          else
          {
              data.forEach(element =>{            
                //  odDetail.push(element.orderDetail._id)
                 OrderDetail.find({"_id":element.orderDetail._id}).then(dd =>{                 
                    dd.forEach(dt =>{                          
                       let rem =Number( dt.remainingQuantity + element.takenQuantity)
                        OrderDetail.update({_id:dt._id},{$set:{
                            "remainingQuantity":rem
                        }})
                        .then(ress =>{
                          
                        })
                    })
                  
                  })
              })
          }
        })
        
        OrderAcceptance.updateMany({
            'supplier':req.body.supplierId,
            'order':req.params.orderId
        },{
            $set:{
                isActive:false,
                status:"Cancelled",
                reason:req.body.reason,
                updateDate:date,
            }
        })
        .exec()
        .then(result =>{
                   
                   res.status(200).json({
                     result:result,
                    message:"You have cancelled an order successfully" 
               });
               })
               .catch(err =>{
                   console.log(err);
                   res.status(500).json({
                       error:err,
                    message:"An error occurred while cancelling an order, can you please try again" 
             
                   });
               })
    })
    
 module.exports =router;