const mongoose =require('mongoose');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../../env/user.model');
var nodemailer = require('nodemailer');
const ForGotPassword = require('../../env/forgotpassword');

router.post('/forgotpassword',(req,res,next) =>{
   User.findOne({email:req.body.email})
   .exec()
   .then(user =>{
    if(user < 1)
    {           
        return res.status(409).json({
            message:'The email provided does not exist '
        })
   }
   else
   {

    const token = jwt.sign({
        email:req.body.email,
        
    },
   "secret",
    {
        expiresIn:"1hr"

    }
    )
    const date = new Date;
    const forgot = new ForGotPassword({
      _id:mongoose.Types.ObjectId(), 
      token:token,
      //expiryDate:req.body.companyName,
      user:user._id,
      createdDate:date.toString(),
      updateDate:date.toString(),
    })
    forgot.save().then(result =>{
      console.log(result);
      res.status(201).json({
      forgotAdd:result,
      message:"Email send to the given email address"
       });
   }).catch(err =>{
       console.log(err);
       res.status(500).json({
           error:err
       })
   });
    sendEmail(req.body.email,token)
   }
   })
   .catch();
})
router.patch('/resetpassword/:token',(req,res,next) =>{  
 

  ForGotPassword.findOne({token:req.params.token})
   .exec()
   .then(tkn =>{
     if(tkn.token == req.params.token)
     {
      User.find({email:req.body.email})
      .exec()
      .then(users =>{
        Categories.update({_id:users._id},{$set:{
          password:req.body.password,
         
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
      })       
     }
     else
     {
       res.status(500).json({
         message:'something went wrong'
       })      
     }
     
   })
   .catch(err =>{
    console.log(err);
    res.status(500).json({
        error:err
    });
})
})



   //function to send emails 
   function sendEmail(email,token)
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
           subject: 'Forgot Password',
           html: "<p>please click this link to reset your password <a href=http://192.168.18.22:4200/forgot-password/reset-password/"+token+">click here</a></p>" // html body
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