const express = require('express');
const router = express.Router();
const Categories = require('../../env/categories.model');
const mongoose = require('mongoose');
const multer = require("multer");

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

router.get('/getparentcategories/:categoryId',(req,res,next) => {     
    Categories.find({
        "categories":req.params.categoryId 
       
    })
    .sort({ createdDate: -1 })
    .select('categoryName categoryImage parentId createdDate')   
    .populate('parentId','categoryName')
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

//Get All date using Get request from Categories Collection
router.get('/getcategories',(req,res,next) => {     
    Categories.find({
         parentId: { $nin: null} 
       
    })
    .sort({ createdDate: -1 })
    .select('categoryName categoryImage parentId createdDate')   
    .populate('parentId','categoryName')
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


router.get('/getcategoriesadmin',(req,res,next) => {     
    Categories.find({
        parentId: null
    })
    .sort({ createdDate: -1 })
    // .select('categoryName categoryImage parentId createdDate')   
    // .populate('parentId','categoryName')
    .exec()
    .then(docs =>{
      
        Categories.find({"parentId":docs[0]._id})
    .select('categoryName categoryImage ')   
    .populate('parentId','categoryName')
    .exec()
    .then(data =>{     
        res.status(200).json(data)
    })
        // res.status(200).json(docs)
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});

router.get('/getcategoryimage/:categoryId',(req,res,next) =>{
    const id = req.params.categoryId;   
    Categories.find({ _id:id})
   // .select(' categoryImage ') 
    .exec()
    .then(docs =>{     
         res.status(200).json(docs)
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
 });
//Get specific date using Get request from Categories Collection
router.get('/getcategorylist',(req,res,next) => {     
    Categories.find({})
    .select('categoryName  ')   
    .populate('parentId','categoryName')
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
// Get Categories Data from Categories collection based on id
router.get('/getsubcategory/:categoryId',(req,res,next) =>{
    const id = req.params.categoryId;   
    Categories.find({"parentId":id})
    .select('categoryName categoryImage ')   
    .populate('parentId','categoryName')
    .exec()
    .then(docs =>{     
         res.status(200).json(docs)
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
 });
//Post  data using POST request in Categories Collection
router.post('/addcategories',upload.single('file'),(req,res,next) => {      
    const date = new Date;
    const category  = new Categories({  
   _id:mongoose.Types.ObjectId(), 
        categoryName:req.body.categoryName,
        categoryImage:req.file.path,
        createdDate:date.toString(),
        updateDate:date.toString(),
        parentId:req.body.parentId,
    }); 
    category.save().then(result =>{
      
        res.status(201).json({
        createdCategory:result,
        message:"You have successfully added a category"
         });
     }).catch(err =>{
         console.log(err);
         res.status(500).json({
             error:err,
             message:'An error occurred while adding a category, can you please try again'
         })
     });
});

// Get Categories Data from Categories collection based on id
router.get('/getcategoriesbyid/:catId',(req,res,next) =>{
    const id = req.params.catId
    Categories.findById(id)
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

 //update Categories Data against CategoriesId
 router.patch('/updatecategory/:catId',upload.single('file'),(req,res,next) =>{
    const id = req.params.catId; 
    if(req.file){       
  Categories.update({_id:id},{$set:{
    categoryName:req.body.categoryName,
    categoryImage:req.file.path,    
    }})
  .exec()
  .then(result =>{
      console.log(result);
      res.status(200).json({
        result:result,
       message:"You have successfully updated a category" 
  });
  })
  .catch(err =>{
      console.log(err);
      res.status(500).json({
          error:err,
       message:"An error occurred while updating a category, can you please try again" 

      });
  })
}
else{
    
    Categories.update({_id:id},{$set:{
        categoryName:req.body.categoryName,               
        }})
      .exec()
      .then(result =>{
         
          res.status(200).json({
            result:result,
           message:"You have successfully updated a category" 
      });
      })
      .catch(err =>{
          console.log(err);
          res.status(500).json({
              error:err,
       message:"An error occurred while updating a category, can you please try again" 

          });
      })
}
});

 //Delete data from Categories collection against Supplier id
 router.delete('/deletecategory/:catId',(req,res,next) =>{
    const id = req.params.catId;
    
  Categories.remove({_id:id})
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
          message:'An error occurred while deleting a category, can you please try again'
      })
  });
 });
module.exports =router;
