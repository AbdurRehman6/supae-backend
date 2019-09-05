const express = require('express');
const swaggerUi = require('swagger-ui-express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const env = require('./env/environment');
const swaggerDocument = require('./api/swagger/swagger.json');
//importing route files
const kitchenRoutes = require('./api/routes/kitchen');
const orderRoutes = require('./api/routes/orders'); 
const supplierRoutes = require('./api/routes/supplier');
const categoriesRouts = require('./api/routes/categories');
const productRouts = require('./api/routes/product');
const forgotPasswordRouts = require('./api/routes/forgotpassword');
const adminRoutes = require('./api/routes/admin');
const wishlistRoutes = require('./api/routes/wishlist');
//connect mongoose with mongodb
mongoose.connect(`mongodb://${env.dbName}:${env.key}@${
    env.dbName
  }.documents.azure.com:${env.port}/${env.dbName}?ssl=true`,{
     
  });
// handling the cors
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers",
    "Origin, X-Requested-With,Content-Type,Accept,Authorization");
    if(req.method ==='OPTIONS')
    {
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET');
        return res.status(200).json({});
    }
    next();
})

//morgan is middleware for logging
app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'))
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
//handling routess
app.use('/users',kitchenRoutes);
app.use('/auth',forgotPasswordRouts);
app.use('/wishlist',wishlistRoutes);
app.use('/admin',adminRoutes);
app.use('/order',orderRoutes);
app.use('/suppliers',supplierRoutes);
app.use('/categories',categoriesRouts);
app.use('/products',productRouts);
app.use('/swagger',swaggerUi.serve,swaggerUi.setup(swaggerDocument));
app.get('/',(req,res,next) =>{
    res.send('Sup Nodejs Api running');
})

//handle requests
app.use((req,res,next) =>{
    const error = new Error('Not Found');
    error.status =404;
    next(error);
})

app.use((error, req,res,next) =>{
res.status(error.status ||500);
res.json({
    error:{
        message:error.message

    }
})
});

module.exports = app;