const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../../env/orders.model')
const Kitchen = require('../../env/kitchens.model');
const generateUniqueId = require('generate-unique-id');
const OrderDetail = require('../../env/order-details.model');
const OrderStatus = require('../../env/order-status.model');
const OrderAcceptance = require('../../env/order-fulfilment.model');
const OrderDetailSupplier = require('../../env/order-detail-supplier.model');
const checkAuth = require('../middleware/auth-check')


//Get All data using Get request from Orders Collection
router.get('/getorders', checkAuth, (req, res, next) => {
    const date = new Date;
    console.log(date.toString)
    Order.find({
            //  "isActive": ture
        })
        .populate('kitchen', 'kitchenName')
        .populate('supplier', 'companyName')
        .exec()
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});
router.get('/getorderdetailsupplier', checkAuth, (req, res, next) => {
    const date = new Date;
    const newd = date.toString;
    console.log(newd.toString)
    OrderDetailSupplier.find({
            orderDetail: '5d5d3f59a7fab547d2125e1b',
            product: '5d5a72279a1cc32d82332262'
        })
        // .populate('kitchen', 'kitchenName')
        // .populate('supplier', 'companyName')
        .exec()
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});
//get kitchenorders against kitchenId
router.get('/getkitchenorders/:kitchenId', checkAuth, (req, res, next) => {
    // console.log(kitchenId)
    const id = req.params.kitchenId;
    Order.find({
            "kitchen": id,
            $and: [{
                $or: [{
                    deleviryDate: "Pending"
                }]
            }]
        })
        .populate('order')
        .populate('supplier', 'companyName')
        //.populate('kitchen')
        .exec()
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});
//Get OpenOrders
router.get('/getopenorders/:categories', (req, res, next) => { 
    let catIds=req.params.categories.split(',')
    let array = catIds + ""
   function mng_cn(e) {      
       return mongoose.Types.ObjectId(e);
   }
   const new_mng_obj = catIds.map(mng_cn);
   OrderDetail.aggregate([{
               $lookup: {
                   from: 'orders',
                   localField: 'order',
                   foreignField: '_id',
                   as: 'orders'
               }

           }, {
               $lookup: {
                   from: 'products',
                   localField: 'product',
                   foreignField: '_id',
                   as: 'ordersDetails'
               },
           },
           {

               $match: {
                    "ordersDetails.categories": {$in: new_mng_obj},
                    "orders.status": "Pending",
                    "orders.isActive":true 
               }
           },
           {
            // $group: {
            //     _id: {
            //         referenceNumber: "$orders.orderRefrence[0]",
            //         // status: "$status",
            //         // "order": "$order",
            //     },
            //     orderSize: {
            //         $sum: 1
            //     }
            // }
            $group: {
                _id: {                  
                    "order": "$order",
                    "_id":"$orders._id",
                    "orderRefrence":"$orders.orderRefrence",
                    "totalPrice":"$orders.totalPrice",
                    "orderQuantity":"$orders.orderQuantity",
                    "deleviryDate":"$orders.deleviryDate",
                    "qaDate":"$orders.qaDate",
                    "status":"$orders.status",
                    "orderType":"$orders.orderType",
                    "createdDate":"$orders.createdDate",
                },
                orderSize: {
                    $sum: 1
                }
           }
        }
        //   {
        //        $project:
        //            {
        //              "orders._id"  :1 ,
        //                "orders.orderRefrence":1,
        //                "orders.totalPrice": 1,
        //                "orders.orderQuantity": 1,
        //                "orders.deleviryDate": 1,
        //                "orders.qaDate": 1,
        //                "orders.status": 1,
        //                "orders.orderType": 1,
        //                "_id"  :0 ,
        //                "orders.createdDate":1,
        //            }
        //   }

       ])
       .exec()
       .then(docs => {        
       
           res.status(200).json(docs);
       })
});

//Cancel orders by suppliers
router.get('/getcancelorders/:supplierId',  (req, res, next) => {
     const id = req.params.supplierId
     OrderAcceptance.aggregate([
        {
            $match: {
                "supplier": mongoose.Types.ObjectId(id),
                "status": "Cancelled",
                "isActive": false
            }
        },
        {
            $group: {
                _id: {
                    referenceNumber: "$referenceNumber",
                    status: "$status",
                    "order": "$order",
                    "createdDate":"$updateDate",
                    reason:"$reason"
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
//Cancel orders by kitchen
router.get('/getkitchencancelorders/:kitchenId', (req, res, next) => {
    console.log(req.body)
    const id = req.params.kitchenId
    OrderStatus.find({
            "status": "Cancel",
            "kitchen": id
        })
        .populate('order')
        .populate('supplier', 'companyName')
        //.populate('kitchen')
        .exec()
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

//delevired orders by kitchen
router.get('/getkitchendeleviredorders/:kitchenId', (req, res, next) => {
    const id = req.params.kitchenId
    Order.find({
            "status": "Delivered",
            "kitchen": id
        })
        //  .populate('order')
        .populate('supplier', 'companyName')
        //.populate('kitchen')
        .exec()
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

//Get in progress Orders
router.get('/getfulfilorders/:supplierId', (req, res, next) => {
    const id = req.params.supplierId;
    console.log(id)
    OrderAcceptance.aggregate([
        {
            $match: {
                "supplier": mongoose.Types.ObjectId(id),
                $and: [{
                                $or: [{
                                    status: "Ready For QA"
                                }, {
                                    status: "QA In Progress"
                                }, {
                                    status: "On the way"
                                }, {
                                    status: "Delivered"
                                }]
                            }],
                "isActive": true
            }
        },
        {
            $group: {
                _id: {
                    referenceNumber: "$referenceNumber",
                    status: "$status",
                    "order": "$order",
                    "createdDate":"$createdDate"
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
router.get('/getinprogressorders/:supplierId', (req, res, next) => {
    const id = req.params.supplierId  
    OrderAcceptance.aggregate([
            {
                $match: {
                    "supplier": mongoose.Types.ObjectId(id),
                    "status": "In Progress",
                    "isActive": true
                }
            },
            {
                $group: {
                    _id: {
                        referenceNumber: "$referenceNumber",
                        status: "$status",
                        "order": "$order",
                        "partialType":"$partialType"
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
router.get('/getinprogressummery/:orderId', (req, res, next) => {
    // console.log('order detail suppmery',JSON.stringify(req.params.orderId))
     var array = req.params.orderId.split(',')
   let orderId = array[0];
   let supplierId  = array[1];
   console.log('orderid',orderId);
   console.log('sup',supplierId);

    // var count =0;
    // var result;
    OrderAcceptance.find({
            "order": orderId,
              "supplier":supplierId,
            //  "status":"In Progress"
        })
         .populate('product')
         .populate('order')
         .populate('orderDetail')
        .exec()
        .then(docs => {
            // updateStatus(req,res,next)

            res.status(200).json(docs);
        })


});
//Get Order details by id 
router.get('/orderdetailsummary/:orderId', (req, res, next) => {
    console.log(req.params.orderId)
    // var count =0;
    // var result;
    OrderDetail.find({
            "order": req.params.orderId
        })
        .populate('product')
        .populate('order')
        .exec()
        .then(docs => {
            // updateStatus(req,res,next)

            res.status(200).json(docs);
        })


});
//Get Order details by id 
router.get('/orderdetails/:orderId', (req, res, next) => {
  
        OrderDetail.find({
            "order": req.params.orderId,
            "remainingQuantity":{$ne:"0"}
        })
        .populate('product')
        .populate('order')

        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err =>{
            res.status(500).json(err)
        });
});

//Post Request To Add Orders data in collection
router.post('/addorders', (req, res, next) => {
    let _order = "Open";
    const date = new Date;
    const refNumber = 'ODR-' + generateUniqueId({
        useNumbers: true,
        useLetters: false,
        length: 6
    });
    if (req.body.supplierId != null) {
        _order = "Close";
    }
    Kitchen.findById(req.body.kitchenId)
        .then(kthn => {
            const date = new Date;
            const orders = new Order({
                _id: mongoose.Types.ObjectId(),
                orderRefrence: refNumber,
                totalPrice: req.body.totalPrice,
                orderQuantity: req.body.orderQuantity,
                isActive: true,
                kitchen: req.body.kitchenId,
                deleviryDate: 'Pending',
                qaDate: null,
                session: req.body.sesionId,
                createdDate: date.toString(),
                status: 'Pending',
                orderType: _order,
            });
            return orders.save();

        })
        .then(result => {
            // if(result.supplier != null)
            // {
            // console.log(req.body._orderDetails.length)    
            for (let i = 0; i < req.body._orderDetails.length; i++) {
                //    console.log(JSON.stringify(req.body._orderDetails[i]))
                const orderDetails = new OrderDetail({
                    _id: mongoose.Types.ObjectId(),
                    product: req.body._orderDetails[i].productId,
                    orderQuantity: req.body._orderDetails[i].orderQuantity,
                    remainingQuantity: req.body._orderDetails[i].orderQuantity,
                    order: result._id,
                    supplier: null,
                    session: req.body.session,
                    createdDate: date.toString(),
                    updatedDate: date.toString()

                });
                orderDetails.save()
                    .then(docs => {
                        //
                        // res.status(201).json({
                        //     orderdetailsCreated:docs
                        // })
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err,
                            message: "An error occurred while placing the order, can you please try it again"
                        })
                    });
            }
            // }
            res.status(201).json({
                result: result,
                message: "Your order has been placed successfully"
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});
// Get Orders Data from kitchen collection based on id
router.get('getorderbyid/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId
    Order.findById(id)
        .populate('kitchenId')
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({
                    message: "no valid entry found against this id"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({})
        });
});

router.post('/acceptorder', (req, res, next) => {
    console.log('==============================')
    console.log('accept order',req.body)
    console.log('==============================')
    // console.log(req.body[0]._orderDetails)
    const updatedDate = new Date;
    const date = new Date;
    const refNumber = 'SUP-' + generateUniqueId({
        useNumbers: true,
        useLetters: false,
        length: 6
    });

    if (req.body._orderDetails[0].partialType == "Complete") {
        let odId = [];
        req.body._orderDetails.forEach(element => {
            odId.push(element.orderDetailId)


        });
        let tempdata = {
            _id: {
                $in: odId.toString().split(',')
            },
        }
        OrderDetail.updateMany(tempdata, {
                $set: {
                    remainingQuantity: 0,
                    updatedDate: updatedDate.toString(),
                }
            }, {
                multi: true
            }).exec()
            .then(details => {
                // console.log('==============================================')
                // console.log('orderId',req.body._orderDetails[0].orderId)
                // console.log('=============================================')

                Order.update({_id:req.body._orderDetails[0].orderId},{$set:{
                    status:"In Progress",                   
                    updateDate:updatedDate.toString(),          
                        }})
                        .exec()
                        .then(od =>{
                            console.log(od);
                        })
            })
    }
    if (req.body._orderDetails[0].partialType == "Partial") {

        let dataa = [];
        req.body._orderDetails.forEach(element => {

            dataa.push({
                orderDetailId: element.orderDetailId,
                remainingQuantity: element.orderQuantity - element.takenQuantity
            })


        })
        let orderDetailIds = [];
        dataa.forEach(element => {
            OrderDetail.update({
                    _id: element.orderDetailId
                }, {
                    $set: {
                        remainingQuantity: element.remainingQuantity,
                        updatedDate: updatedDate.toString(),
                    }
                })
                .then(details => {})

        })
    }
    if (req.body._orderDetails[0].partialType == "SubPartial") {

        let dataa = [];
        req.body._orderDetails.forEach(element => {

            dataa.push({
                orderDetailId: element.orderDetailId,
                remainingQuantity: element.orderQuantity - element.takenQuantity
            })


        })
        let orderDetailIds = [];
        dataa.forEach(element => {
            OrderDetail.update({
                    _id: element.orderDetailId
                }, {
                    $set: {
                        remainingQuantity: element.remainingQuantity,
                        updatedDate: updatedDate.toString(),
                    }
                })
                .then(details => {})

        })
    }
    let data = {};
    for (let i = 0; i < req.body._orderDetails.length; i++) {     
        const orderAcceptance = new OrderAcceptance({
            _id: mongoose.Types.ObjectId(),
            product: req.body._orderDetails[i].productId,
            takenQuantity: req.body._orderDetails[i].takenQuantity,
            order: req.body._orderDetails[i].orderId,
            orderDetail: req.body._orderDetails[i].orderDetailId,
            supplier: req.body._orderDetails[i].supplierId,
            referenceNumber: refNumber,
            isActive: true,
            status: "In Progress",
            partialType:  req.body._orderDetails[i].partialType,
            createdDate: date.toString(),
            updatedDate: date.toString()

        });
        orderAcceptance.save()
            .then(docs => {
                data = docs


            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err,
                    message: "We are getting an error while saving the order, you can you please try again "
                });
            })
    }
    res.status(200).json({

        message: 'You have successfully accepted the order'
    })



})
//patch request if supplier fulfill  order
router.patch('/updatestatusbysup/:orderId', (req, res, next) => {
    console.log(req.body.supplierId)
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
          Order.update({
            _id: id
        }, {
            $set: {
                // status: req.body.status,           
                updateDate: updatedDate.toString(),
            }
            
        })
        .exec()
        .then(data => {

        })
        res.status(200).json({
            data:result,
            message:'You have successfully chenged the status'
        })
        })
})
//patch request if supplier cancel  order
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
          console.log('in if condition')
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
              console.log(data);          
            //  odDetail.push(element.orderDetail._id)
             OrderDetail.find({"_id":element.orderDetail._id,"product":element.orderDetail.product}).then(dd =>{                 
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
//patch request if kitchen cancel  order
router.patch('/cancelkitchenorder/:orderId', checkAuth, (req, res, next) => {
    //console.log('bsdasdkajhdasd'+JSON.stringify(req.body))
    const id = req.params.orderId;
    const date = new Date;
    const orderstatus = new OrderStatus({
        _id: mongoose.Types.ObjectId(),
        order: id,
        kitchen: req.body.kitchenId,
        createdDate: date.toString(),
        updateDate: date.toString(),
        status: "Cancel",
        reason: req.body.reason
    });
    orderstatus.save().then(result => {
        console.log(result);
        // res.status(201).json({
        // orderstatuscreated:result
        //  });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
    const updatedDate = new Date;
    Order.update({
            _id: id
        }, {
            $set: {
                status: "Cancel",
                supplier: null,
                isActive: false,
                updateDate: updatedDate.toString(),
            }
        })
        .exec()
        .then(result => {
            console.log('result', result);
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
})

//patch request if supplier accepts Partialy complete products
router.patch('/partialyacceptedorder/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId;

    if (req.body.partialType == "partial completed") {
        let ids = [];
        const updatedDate = new Date;
        req.body.orderDetailId.forEach(element => {

            ids.push(element);
        })
        let temp = ids.toString().split(',');
        let tempdata = {
            _id: {
                $in: ids.toString().split(',')
            },
            // multi:true,

        }
        console.log(temp);
        OrderDetail.updateMany(tempdata, {
                $set: {
                    supplier: req.body.supplierId,
                    orderDetailStatus: 'In Progress',
                    updateDate: updatedDate.toString(),
                }
            }, {
                multi: true
            }).exec()
            .then(details => {

                Order.update({
                        _id: id
                    }, {
                        $set: {
                            status: 'Partialy Accepted',
                            updateDate: updatedDate.toString(),
                        }
                    })

                    .then(result => {
                        console.log('result', result);
                        //     res.status(200).json({
                        //         result:result,
                        //        message:"Order accepted" 
                        //   });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    })

                res.status(200).json({
                    details: details,
                    message: "You have successfully accepted the order partially"
                });
                // updateStatus(req,res,next)
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            })
    }
    if (req.body.partialType == "partial not completed") {

        const date = new Date;
        const updatedDate = new Date;

        Order.update({
                _id: req.params._id
            }, {
                $set: {
                    status: 'Partialy Accepted',
                    updateDate: updatedDate.toString(),
                }
            })
            .exec()
            .then(result => {
                for (let i = 0; i < req.body.partialOrder.length; i++) {
                    //    console.log(JSON.stringify(req.body._orderDetails[i]))
                    const orderdtlsup = new OrderDetailSupplier({
                        _id: mongoose.Types.ObjectId(),
                        quantity: req.body.partialOrder[i].productQuantity,
                        product: req.body.partialOrder[i].productId,
                        supplier: req.body.supplierId,
                        orderDetail: req.body.orderDetailId[i],
                        session: req.body.sesionId,
                        createdDate: date.toString(),
                        orderDetailSupplierStatus: 'In Progress',
                        order: req.params.orderId,

                    });
                    orderdtlsup.save()
                        .then(docs => {
                            Order.update({
                                    _id: id
                                }, {
                                    $set: {
                                        status: 'Partialy Accepted',
                                        updateDate: updatedDate.toString(),
                                    }
                                })
                                .exec()
                                .then(result => {

                                })
                            console.log(docs)
                            // res.status(201).json({
                            //     orderdetailsCreated:docs
                            // })
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err,
                                message: "Error on saving order supllier details"
                            })
                        });
                }
            })
        return res.status(201).json({
            message: 'order created'
        });
    }

})
//patch request if supplier cancel partial order
router.patch('/cancelpartialorder/:orderDetailId', (req, res, next) => {
    const id = req.params.orderDetailId;
    const orderdetailSupId = req.body.orderDetailId;
    const date = new Date;

    if (req.body.partialType == "not partial complete") {
        const orderstatus = new OrderStatus({
            _id: mongoose.Types.ObjectId(),
            order: req.body.orderId,
            orderdetail: id,
            supplier: req.body.supplierId,
            createdDate: date.toString(),
            updateDate: date.toString(),
            status: "Cancel",
            reason: req.body.reason
        });
        orderstatus.save().then(result => {
            console.log(result);

        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
        OrderDetailSupplier.remove({
                _id: orderdetailSupId
            })
            .exec()
            .then(result => {
                res.status(200).json(result)
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                })
            });
    }
    const orderstatus = new OrderStatus({
        _id: mongoose.Types.ObjectId(),
        orderDetail: id,
        order: req.body.orderId,
        supplier: req.body.supplierId,
        createdDate: date.toString(),
        updateDate: date.toString(),
        status: "Cancel",
        reason: req.body.reason
    });
    orderstatus.save().then(result => {
        console.log(result);

    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
    const updatedDate = new Date;
    OrderDetail.update({
            _id: id
        }, {
            $set: {
                status: "",
                supplier: null,
                updateDate: updatedDate.toString(),
            }
        })
        .exec()
        .then(result => {
            console.log('result', result);
            res.status(200).json({
                result: result,
                message: 'You have canceled the order successfully'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err,
                message: 'An error encountered while canceling the order, can you please try again'
            });
        })
})



//Delete data from Orders collection against Order id
router.delete('deleteorder/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId;

    Order.remove({
            _id: id
        })
        .exec()
        .then(result => {
            res.status(200).json({
                result: result,
                message: "You have successfully deleted an order"
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});



module.exports = router;