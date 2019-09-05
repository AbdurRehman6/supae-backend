const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Wishlist = require('../../env/wishlist.model');
const checkAuth = require('../middleware/auth-check')

//Post  data using POST request in wishlist Collection
router.post('/addwishlist',checkAuth, (req, res, next) => {  
    
    const date = new Date;
    Wishlist.find({kitchen:req.body.kitchenId,product:req.body.productId})    
    .exec()
    .then(user =>{ 
        console.log(user)
       if(user.length >= 1)
        {  
                  
            return res.status(200).json({
                message:'Product already exist in wishlist'
            })
       }
       else
       {
    const wishlist = new Wishlist({
        _id: mongoose.Types.ObjectId(),
        kitchen: req.body.kitchenId,
        product: req.body.productId,
        user: req.body.userId,
        createdDate: date.toString(),
        updateDate: date.toString(),
    });
    wishlist.save().then(result => {
        console.log(result);
        res.status(201).json({
            createdWishList: result,
            message:"The product has been successfully added to wishlist"
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
}
    })  
});
// Get wishlists  from wishlist collection based on id
router.get('/getwishlist/:kitchenId', (req, res, next) => {
    const id = req.params.kitchenId;
    Wishlist.find({
            "kitchen": id
        })
        .populate('product')
        .exec()
        .then(docs => {
            res.status(200).json(docs)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});
router.get('/getwishlistids/:kitchenId', (req, res, next) => {
    const id = req.params.kitchenId;
    Wishlist.find({
            "kitchen": id
        })
        .exec()
        .then(docs => {
            res.status(200).json(docs)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});
router.delete('/deletewishlist/:wishlistId',checkAuth, (req, res, next) => {
    const id = req.params.wishlistId;
    
    Wishlist.remove({_id:id})
    .exec()
    .then(result =>{
        res.status(200).json({
            result:result,
           message:"You have successfully deleted the wishlist" 
      })
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    });


})


module.exports = router;
