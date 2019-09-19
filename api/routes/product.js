const express = require('express');
const router = express.Router();
const Products = require('../../env/product.model');
const mongoose = require('mongoose');
const multer = require("multer");
const checkAuth = require('../middleware/auth-check');

//Save images in folders
const storage = multer.diskStorage({
    destination:function(req,file,cb){
    cb(null,'./uploads/');
    },
    filename:function(req,file,cb){
    cb(null,new Date().toISOString() + file.originalname)
    }
    });

    //check if file type is .jpg and .png
const fileFilter = (req,file,cb) =>{
    if(file.mimetype ==='image/jpeg' || file.mimetype ==='image/png')
    {
        //accept a file
    cb(null,true)
    }
    else
    {
   //reject a file
   cb(null,false);
    }
}
// apply storage limits image cannot be greater than 5mb
const upload = multer({
    storage:storage,
    limits:{
fileSize: 1024 * 1024 * 5
},
fileFilter:fileFilter
});

//Get All data using Get request from Products Collection
router.get('/getproducts',(req,res,next) => {     
    Products.find({})
    .populate('categories','categoryName')
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
router.get('/getproductssup/:categoryId',(req,res,next) =>{
    
    const id = req.params.categoryId
    console.log(id);
    Products.find({categories:id})
     .populate('categories')
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
// Get Categories Data from Categories collection based on id
router.get('/getproductsbyid/:productId',(req,res,next) =>{
    const id = req.params.productId
    Products.findById(id)
    .populate('categories','categoryName')
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
 // Get Categories Data from Categories collection based on id
router.get('/getproductsbycategory/:categoryId',(req,res,next) =>{
    const id = req.params.categoryId
   
    Products.find({"categories":id})
    .populate('categories')
    // Products.findById(id)
    // .exec()
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

//Post  data using POST request in Product Collection
router.post('/addproducts',upload.single('file'),(req,res,next) => {  

    console.log(req.body);  
    const date = new Date;     
        const product  = new Products({  
            _id:mongoose.Types.ObjectId(), 
            productName:req.body.productName,
            region:req.body.region,
            price:req.body.price,
            unit:req.body.unit,
            description:req.body.description,
            inStock:req.body.inStock,    
            image:req.file.path,
           createdDate:date.toString(),
           updateDate:date.toString(),
           categories:req.body.categoryId,
       }); 
       product.save().then(result =>{  
           res.status(201).json({
           productCreated:result,
           message:'You have successfully added a product'
            });
        }).catch(err =>{  
            res.status(200).json({
                // error:'An error occurred while adding a product, can you please try again',
                message:'An error occurred while adding a product, can you please try again'
                       })
      
            // })
        });
        
    

});

 //update Products Data against productId
 router.patch('/updateproduct/:productId',upload.single('file'),(req,res,next) =>{  
    console.log(req.body)    
    const id = req.params.productId; 
    const updatedDate = new Date;  
    if(req.file){       
  Products.update({_id:id},{$set:{
    productName:req.body.productName,
    region:req.body.region,
    price:req.body.price,
    unit:req.body.unit,
    description:req.body.description,
    categories:req.body.categoryId,
    inStock:req.body.inStock,    
    image:req.file.path,  
    updateDate:updatedDate.toString(), 
    }})
  .exec()
  .then(result =>{
      console.log(result);
      res.status(200).json({
        result:result,
       message:"You have updated a product successfully" 
  });
  })
  .catch(err =>{
      console.log(err);
      res.status(500).json({
          error:err,
       message:"An error occurred while updating a product, can you please try again" 

      });
  })
}
else
{
    Products.update({_id:id},{$set:{
    productName:req.body.productName,
    region:req.body.region,
    price:req.body.price,
    unit:req.body.unit,
    description:req.body.description,
    inStock:req.body.inStock, 
    categories:req.body.categoryId,   
    updateDate:updatedDate.toString(),          
        }})
      .exec()
      .then(result =>{         
          res.status(200).json({
            result:result,
           message:"You have updated a product successfully" 
      });
      })
      .catch(err =>{
          console.log(err);
          res.status(500).json({
              error:err,
       message:"An error occurred while updating a product, can you please try again" 

          });
      })
}
});

 //Delete data from products collection against product id
 router.delete('/deleteproduct/:productId',(req,res,next) =>{
    const id = req.params.productId;
    
  Products.remove({_id:id})
  .exec()
  .then(result =>{
      res.status(200).json({
        result:result,
       message:"You have successfully deleted a product" 
  })
  })
  .catch(err =>{
      console.log(err);
      res.status(500).json({
          error:err,
       message:"An error occurred while deleting a product, can you please try again" 

      })
  });
 });
 router.get('/productsearch/:query',(req,res,next) =>{
    
    const dataQuery = req.params.query
    console.log(dataQuery.charAt(0).toUpperCase() + dataQuery.slice(1));
    Products.aggregate([{         

        $match: {
            productName:{$regex:'.*'+ dataQuery.charAt(0).toUpperCase() + dataQuery.slice(1) +'.*'}
        }
    },
    {
               $project:
                   {
                     "_id"  :1 ,
                       "productName":1,
                       "region": 1,
                       "price": 1,
                       "unit": 1,
                       "description": 1,
                       "image": 1,
                       "categories": 1,                     
                   }
           } 
   
])
.exec()
.then(data =>{
    res.status(200).json(data);
})
    // Products.find({categories:id})
    //  .populate('categories')
    // .exec()
    // .then(doc =>{
    //    if(doc)
    //    {
    //      res.status(200).json(doc);
    //    }
    //    else
    //    {
    //        res.status(404).json({
    //            message:"no valid entry found against this id"
    //        });
    //    }
    // })
    // .catch(err =>{
    //     console.log(err);
    //     res.status(500).json({})
    // });
 });


module.exports =router;
