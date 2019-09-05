const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../../env/orders.model')
const Kitchen = require('../../env/kitchens.model');
const generateUniqueId = require('generate-unique-id');
const OrderDetail = require('../../env/order-details.model');
const OrderStatus = require('../../env/order-status.model');
const SupplierRefrance = require('../../env/supplier-ref.model');
const OrderAcceptance = require('../../env/order-accaptance.model');
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
router.get('/getopenorders', (req, res, next) => {
    Order.find({
   
           $and: [{
                $or: [ {
                    status: "Partialy Accepted"
                }, {
                    status: "Pending"
                }]
            }]

        })

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
//Cancel orders by suppliers
router.get('/getcancelorders/:supplierId', checkAuth, (req, res, next) => {
    const id = req.params.supplierId
    OrderStatus.find({
            "status": "Cancel",
            "supplier": id
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
    const id = req.params.supplierId
    OrderStatus.find({
            "supplier": id,
            $and: [{
                $or: [{
                    status: "Ready For QA"
                }, {
                    status: "QA in progress"
                }, {
                    status: "On the way"
                }, {
                    status: "Delivered"
                }]
            }]

        })
        .populate('order')
        // .populate('supplier','companyName')
        .exec()
        .then(docs => {
            OrderDetail.find({
                    $and: [{
                        $or: [{
                            orderDetailStatus: "Ready For QA"
                        }, {
                            orderDetailStatus: "QA in progress"
                        }, {
                            orderDetailStatus: "On the way"
                        }, {
                            orderDetailStatus: "Delivered"
                        }]
                    }],
                    "supplier": id
                })
                .populate('order')
                // .populate('supplier','companyName')
                .exec()
                .then(data => {
                    Order.find({
                            $and: [{
                                $or: [{
                                    status: "Ready For QA"
                                }, {
                                    status: "QA in progress"
                                }, {
                                    status: "On the way"
                                }, {
                                    status: "Delivered"
                                }]
                            }],
                            "supplier": id
                        })
                        .exec()
                        .then(ordr => {
                            OrderDetailSupplier.find({
                                    $and: [{
                                        $or: [{
                                            orderDetailSupplierStatus: "Ready For QA"
                                        }, {
                                            orderDetailSupplierStatus: "QA in progress"
                                        }, {
                                            orderDetailSupplierStatus: "On the way"
                                        }, {
                                            orderDetailSupplierStatus: "Delivered"
                                        }]
                                    }],

                                    "supplier": id
                                })
                                .select('product orderDetailStatus')
                                .populate("supplier", "compnayName")
                                .exec()
                                .then(ods => {
                                    console.log(docs)
                                    var data_array =[] ;
                                    var ods_array =[] ;
                                     if (data.length > 0) {
                                     for (let j = 0; j < data.length; j++) {
                                        
                                        // if (data[i].order.statuss == null) {
                                            var OrderDetailsTemp = {
                                                orderRefrence: data[j].order.orderRefrence,
                                                status: data[j].order.status,
                                                orderId: data[j].order._id,
                                                totalPrice: data[j].order.totalPrice,
                                                _id: data[j]._id,
                                                orderQuantity: data[j].orderQuantity,
                                                product: data[j].product,
                                                //  status: data[0].status,
                                                supplier: data[j].supplier,
                                                isActive: data[j].isActive,
                                                createdDate: data[j].createdDate,
                                                
                                            };

                                        // data_array.push(OrderDetailsTemp);
                                    //  }
                                      
                                            console.log(data_array)
                                           

                                        }


                                    }
                                    if (ods.length > 0) {
                                       
                                        for (let k = 0; k < ods.length; k++) {
                                            var OrderDetailSupplierTemp = {
                                                orderRefrence: ods[k].order.orderRefrence,
                                                status: ods[k].order.status,
                                                orderId: ods[k].order._id,
                                                totalPrice: ods[k].order.totalPrice,
                                                _id: ods[k]._id,
                                                orderQuantity: ods[k].order.orderQuantity,
                                                product: ods[k].product,
                                                supplier: ods[k].supplier,
                                                isActive: ods[k].isActive,
                                                createdDate: ods[k].createdDate,
                                            };
                                            ods_array.push(OrderDetailSupplierTemp);
                                          
                                        }
                                     
                                    
                                        var ob = data_array.concat(ordr);
                                        ods_array.forEach((element)=>{
                                            ob.push(element)
                                        })
                                        // var obj1 = ob.concat(ods_array);
                                         //  console.log('obj1',obj1)
                                       //  res.status(200).json(obj1);
                                        res.status(200).json(ob);
                                    } 
                                    var obj1 = data.concat(ordr);
                                    var obj2 = obj1.concat(ods);
                                    res.status(200).json(obj2);
                                    // if (docs.length > 0) {
                                    //     var OrderStatusTemp = [{
                                    //         orderRefrence: docs[0].order.orderRefrence,
                                    //         status: docs[0].order.status,
                                    //         orderId: docs[0].order._id,
                                    //         totalPrice: docs[0].order.totalPrice,
                                    //         _id: docs[0]._id,
                                    //         orderQuantity: docs[0].orderQuantity,
                                    //         product: docs[0].product,
                                    //         status: docs[0].status,
                                    //         supplier: docs[0].supplier,
                                    //         isActive: docs[0].isActive,
                                    //         createdDate: docs[0].createdDate,

                                    //     }];
                                    //     console.log(OrderStatusTemp)
                                    //     var ob = OrderStatusTemp.concat(data);
                                    //     var obj1 = ob.concat(ordr);
                                    //     var obj2 = obj1.concat(ods);
                                    //     res.status(200).json(obj2);


                                    //     // var obj = Object.assign(docs,data,ordr,ods);
                                    // }
                                    // if (data.length > 0) {
                                    //     var OrderDetailsTemp = [{
                                    //         orderRefrence: data[0].order.orderRefrence,
                                    //         status: data[0].order.status,
                                    //         orderId: data[0].order._id,
                                    //         totalPrice: data[0].order.totalPrice,
                                    //         _id: data[0]._id,
                                    //         orderQuantity: data[0].orderQuantity,
                                    //         product: data[0].product,
                                    //         status: data[0].status,
                                    //         supplier: data[0].supplier,
                                    //         isActive: data[0].isActive,
                                    //         createdDate: data[0].createdDate,

                                    //     }];
                                    //     console.log(OrderDetailsTemp)
                                    //     var ob = OrderDetailsTemp.concat(ordr);
                                    //     var obj1 = ob.concat(ods);
                                    //     res.status(200).json(obj1);
                                    // }
                                    // if (ods.length > 0) {
                                    //     var OrderDetailSupplierTemp = [{
                                    //         orderRefrence: ods[0].order.orderRefrence,
                                    //         status: ods[0].order.status,
                                    //         orderId: ods[0].order._id,
                                    //         totalPrice: ods[0].order.totalPrice,
                                    //         _id: ods[0]._id,
                                    //         orderQuantity: ods[0].orderQuantity,
                                    //         product: ods[0].product,
                                    //         status: ods[0].status,
                                    //         supplier: ods[0].supplier,
                                    //         isActive: ods[0].isActive,
                                    //         createdDate: ods[0].createdDate,

                                    //     }];
                                    //     console.log(OrderDetailSupplierTemp)
                                    //     var ob = OrderDetailSupplierTemp.concat(ordr);
                                    //     var obj1 = ob.concat(data);
                                    //     res.status(200).json(obj1);
                                    // } else {
                                    //     var obj1 = data.concat(ordr);
                                    //     var obj2 = obj1.concat(ods);
                                    //     res.status(200).json(obj2);
                                    // }
                                })

                        })

                })

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
 
});
//Get in progress Orders

router.get('/getinprogressorders/:supplierId', (req, res, next) => {
    const id = req.params.supplierId   
    OrderStatus.find({
            "status": "In Progress",
            "supplier": id
        })
        .populate('order', 'orderRefrence status')
        // .populate('supplier','companyName')
        .exec()
        .then(docs => {
            //  console.log('OrderStatus',docs)
            OrderDetail.find({
                    "orderDetailStatus": "In Progress",
                    "supplier": id
                })
                .populate('order')
                // .populate('supplier','companyName')
                .exec()
                .then(data => {                   

                    Order.find({
                            "status": "In Progress",
                            "supplier": id
                        })
                        // .populate('supplier','companyName')
                        .exec()
                        .then(ordr => {                     
                            // console.log('Order',ordr)
                            OrderDetailSupplier.find({
                                    "orderDetailSupplierStatus": "In Progress",
                                    "supplier": id
                                })
                                .select('product orderDetailStatus')
                                //.populate("supplier")
                                .populate("orderDetail")
                                .populate('order')

                                .exec()
                                .then(ods => {  

                                    // console.log('_________________________________');
                                      
                                    // console.log('OrderDetail',data);
                                    // console.log('++++++++++++++++++++++++++++');
                                    // console.log('_________________________________');
                                      
                                    // console.log('order',ordr);
                                    // console.log('++++++++++++++++++++++++++++');
                                    // console.log('_________________________________');
                                      
                                    // console.log('OrderDetailSupplier',ods);
                                    // console.log('++++++++++++++++++++++++++++');
                                    var order_array =[] ;                       
                                    var data_array =[] ;
                                    var ods_array =[] ;
                                    if (ordr.length > 0) {   
                                                                                      
                                        for (let index = 0; index < ordr.length; index++) {
                                           
                                            var orders = {
                                                orderRefrence: ordr[index].orderRefrence,
                                                status: ordr[index].status,
                                                orderId: ordr[index]._id,
                                                totalPrice: ordr[index].totalPrice,
                                               // _id: ordr[index]._id,
                                                orderQuantity: ordr[index].orderQuantity,
                                                product: ordr[index].product,
                                                //  status: data[0].status,
                                                supplier: ordr[index].supplier,
                                                isActive: ordr[index].isActive,
                                                createdDate: ordr[index].createdDate,
                                                
                                            };
                                            order_array.push(orders);
                                        }
                                    }
                                     if (data.length > 0) {
                                     for (let j = 0; j < data.length; j++) {
                           
                                        // if (data[i].order.statuss == null) {
                                            var OrderDetailsTemp = {
                                                orderRefrence: data[j].order.orderRefrence,
                                                status: data[j].order.status,
                                                orderId: data[j].order._id,
                                                totalPrice: data[j].order.totalPrice,
                                                _id: data[j]._id,
                                                orderQuantity: data[j].orderQuantity,
                                                product: data[j].product,
                                                //  status: data[0].status,
                                                supplier: data[j].supplier,
                                                isActive: data[j].isActive,
                                                createdDate: data[j].createdDate,
                                                
                                            };

                                         data_array.push(OrderDetailsTemp);
                                      
                                    //  }
                                        }
                                    }

                                    if (ods.length > 0) {
                                      
                                        for (let k = 0; k < ods.length; k++) {
                                            var OrderDetailSupplierTemp = {
                                                orderRefrence: ods[k].order.orderRefrence,
                                                status: ods[k].order.status,
                                                orderId: ods[k].order._id,
                                                totalPrice: ods[k].order.totalPrice,
                                                _id: ods[k]._id,
                                                orderDetailId:ods[k].orderDetail,
                                                orderQuantity: ods[k].order.orderQuantity,
                                                product: ods[k].product,
                                                supplier: ods[k].supplier,
                                                isActive: ods[k].isActive,
                                                createdDate: ods[k].createdDate,
                                            };
                                            ods_array.push(OrderDetailSupplierTemp);
                                           
                                        }
                                  
                                    } 
                                    var ob = data_array.concat(order_array);
                                    ods_array.forEach((element)=>{
                                        ob.push(element)
                                    })
                                    // var obj1 = ob.concat(ods_array);
                                     //  console.log('obj1',obj1)
                                   //  res.status(200).json(obj1);
                                    res.status(200).json(ob);

                                    // var obj1 = data_array.concat(order_array);
                                    // var obj2 = obj1.concat(ods);
                                    // res.status(200).json(obj2);


                                })

                        })

                })

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
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
    // var count = 0;
    let data = {}
    let temarray = [];
    OrderDetail.find({
            "order": req.params.orderId
        })
        .populate('product')
        .populate('order')

        .then(docs => {
            data = docs
            console.log(data);
            var allTrue = Object.keys(data).every(function (k) {
                return data[k].orderDetailStatus === 'In Progress'
            });

            if (allTrue) {

                // data.forEach(element => {
                //     element.orderQuantity =0;
                // }); 
                console.log( data[0].order._id)
                Order.update({
                        _id: data[0].order._id
                    }, {
                        $set: {
                            status: "In Progress",

                        }
                    })
                    .then(result => {

                    })
                // return res.status(200).json(data)
            }

        }).then(abc => {

            // data.forEach(element => {
            //     console.log('element',element.supplier)
            //         if (element.supplier != null) 
            //   {
            //     data[element].orderQuantity =0;

            //   }
            //   else
            //   {
            //       console.log('null');

            //   }
            //   }); 



            let ids = [];
            for (let i = 0; i < data.length; i++) {

               // console.log('element', data[i].supplier)
                if (data[i].supplier !== null) {
                    data[i].orderQuantity = 0;

                } else {
                    ids.push({
                        orderDetailId: data[i]._id,
                        productId: data[i].product._id
                    })
                }

            }
            console.log('------------------------------')
              console.log(ids)
     console.log('-----------------------------------------')
            if (ids.length) {             
                let orderDetailIDs = [];
                let orderProductIDs = [];
                for (var i = 0; i < ids.length; ++i) {
                    orderDetailIDs.push(ids[i].orderDetailId);
                    orderProductIDs.push(ids[i].productId);
                }

                // for (var i = 0; i < ids.length; ++i) {
                //     orderProductIDs.push(ids[i].productId);
                // }
                
                OrderDetailSupplier.find({
                    product: orderProductIDs,
                    orderDetail: orderDetailIDs
                }).then(result => {
                    console.log(result)
                    data.map(item => {
                        result.map(res2 => {

                            if (item.product._id.toString() === res2.product.toString() && item._id.toString() === res2.orderDetail.toString()) {
                                item.orderQuantity = Number(item.orderQuantity) - Number(res2.quantity);
                            }
                        })
                    })

                    //console.log('1st', data)
                    return res.status(200).json(data);
                })

            } else {
               // console.log('2nd', data)
                return res.status(200).json(data);
            }

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

//Post Request To Add Orders data in collection
router.post('/addorders', checkAuth, (req, res, next) => {  
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
                supplier: req.body.supplierId,
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
//patch request if supplier accepts entire order
router.post('/acceptentireorder', checkAuth, (req, res, next) => {
    const date = new Date;
    const refNumber = 'SUP-' + generateUniqueId({
        useNumbers: true,
        useLetters: false,
        length: 6
    });
    // const id = req.params.orderId;
    const supplierRef = new SupplierRefrance({
        _id: mongoose.Types.ObjectId(),
        supplierOrderRefrence: refNumber,
        status: req.body.status,
        partialType:req.body.partialType,   
        createdDate: date.toString(),
        updatedDate: date.toString()

    });
    supplierRef.save()
     .then(result =>{  
        for (let i = 0; i < req.body._orderDetails.length; i++) {
            //    console.log(JSON.stringify(req.body._orderDetails[i]))
            const orderAcceptance = new OrderAcceptance({
                _id: mongoose.Types.ObjectId(),
                takenQuantity: req.body._orderDetails[i].takenQuantity,
                orderDetail: req.body._orderDetails[i].orderDetailId,
                supplierRef: result._id,
                supplier: req.body._orderDetails[i].supplierId,              
                createdDate: date.toString(),
                updatedDate: date.toString()

            });
            orderAcceptance.save()
                .then(docs => {
                    res.status(200).json({
                        doc:docs,
                        message:"You have successfully accepted the entire order"
                    })

                })
                .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err,
                                message:"We are getting an error while saving the order, you can you please try again "
                            });
                        })
            }
    })

    // Order.update({
    //         _id: id
    //     }, {
    //         $set: {
    //             status: "In Progress",
    //             supplier: req.body.supplierId,
    //             // orderRefrence:"SUP-324A2b234",
    //             updateDate: updatedDate.toString(),
    //         }
    //     })
    //     .exec()
    //     .then(result => {
    //         // console.log('result', result);
    //         res.status(200).json({
    //             result: result,
    //             message: "You have successfully accepted the entire order"
    //         });
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         res.status(500).json({
    //             error: err,
    //             message:"We are getting an error while saving the order, you can you please try again "
    //         });
    //     })
})
//patch request if supplier fulfill  order
router.patch('/updatestatusbysup/:orderId', (req, res, next) => {
    console.log('--------------------------')
    console.log(req.body)
    console.log('--------------------------')
    const id = req.params.orderId
    const updatedDate = new Date;
    Order.update({
            _id: id
        }, {
            $set: {
                status: req.body.status,
                supplier: req.body.supplierId,
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
    if (req.body.partialType == "Partialy completed") {
        const updatedDate = new Date;
        const orderDetailId = req.body.orderDetailId;
        OrderDetail.update({
                _id: orderDetailId
            }, {
                $set: {
                    orderDetailStatus: "Ready for QA",
                    updateDate: updatedDate.toString(),
                }
            })
            .exec()
            .then(result => {
                // console.log('result', result);
                res.status(200).json({
                    result: result,
                    message: "Order fulfilled"
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            })

    } else if (req.body.partialType == "Partial not completed") {
        const updatedDate = new Date;
        const orderDetailSuppllierId = req.body.orderDetailSuppllierId;
        OrderDetailSupplier.update({
                _id: orderDetailSuppllierId
            }, {
                $set: {
                    orderDetailSupplierStatus: "Ready for QA",
                    updateDate: updatedDate.toString(),
                }
            })
            .exec()
            .then(result => {
                // console.log('result', result);
                res.status(200).json({
                    result: result,
                    message: "Order fulfilled"
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            })

    }
})
//patch request if supplier cancel  order
router.patch('/cancelorder/:orderId', checkAuth, (req, res, next) => {
    //console.log('bsdasdkajhdasd'+JSON.stringify(req.body))
    const id = req.params.orderId;
    const date = new Date;
    const orderstatus = new OrderStatus({
        _id: mongoose.Types.ObjectId(),
        order: id,
        supplier: req.body.supplierId,
        createdDate: date.toString(),
        updateDate: date.toString(),
        status: "Cancel",
        reason: req.body.reason
    });
    orderstatus.save().then(result => {
        console.log({
            result:result,
        });

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
                status: "Pending",
                supplier: null,
                updateDate: updatedDate.toString(),
            }
        })
        .exec()
        .then(result => {
            console.log('result', result);
            res.status(200).json({
                result: result,
                message: "You have canceled the order successfully "
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err,
                message: 'Error on canceling the order'
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
          let ids =[];
        const updatedDate = new Date;
       req.body.orderDetailId.forEach(element =>{
     
        ids.push(element);
       })
       let temp = ids.toString().split(',');
       let tempdata ={
                    _id:{$in:ids.toString().split(',')},
           // multi:true,
        
       }
           console.log(temp);
                OrderDetail.updateMany(tempdata, {
                $set: {
                    supplier: req.body.supplierId,
                    orderDetailStatus: 'In Progress',
                    updateDate: updatedDate.toString(),
                }
            },{multi:true}).exec()
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
                        order:req.params.orderId,

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
router.patch('/cancelpartialorder/:orderDetailId',  (req, res, next) => {
    const id = req.params.orderDetailId;
    const orderdetailSupId = req.body.orderDetailId;
    const date = new Date;

    if (req.body.partialType == "not partial complete") {
        const orderstatus = new OrderStatus({
            _id: mongoose.Types.ObjectId(),
            order: req.body.orderId,
            orderdetail:id,
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
