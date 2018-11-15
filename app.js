var express = require('express');
var path = require('path');
var cors = require('cors');
// var favicon = require('serve-favicon');
var logger = require('morgan');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// const session = require('express-session');
// const MongoStore = require('connect-mongo')(session);
var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.use(cors())

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
// app.set('trust proxy', true);
var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/bookshop');
mongoose.connect('mongodb://itree:itree123@ds157503.mlab.com:57503/bookshop');
mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.on("error",console.error.bind(console,'# Mongo db connection error'));
// app.use(cookieParser());
//---------------session
// app.use(session({

//   secret : 'SecretString',
//   saveUninitialized : false,
//   resave : false,
//   //cookie : {maxAge : 1000*60*60*24*2},
//   cookie: {maxAge: 1000 * 60 * 60 * 24 * 2},
//   store : new MongoStore({mongooseConnection : db,ttl : 2*24*60*60})
// }))
 
//-----------post session in mongo

// app.post("/cart",function(req,res){
//   var cart = req.body; 
//   req.session.cart = cart;
//   req.session.save(function(err){
//     if(err){
//       throw err;
//     }
//     res.json(req.session.cart);
//   })
// })

//-------------get session in mongo

// app.get("/cart",function(req,res){
//   if(typeof req.session.cart != "undefined"){
//     res.json(req.session.cart);
//   }
// })

var Books = require('./models/books');



//------------------------------------books
app.post('/books',function(req,res){
  var book = req.body;
  Books.create(book,function(err,books){
    if(err){
      throw err;
    }
    res.json(books);
  })
});

app.get('/books',function(req,res){
  Books.find(function(err,books){
    if(err){
      throw err;
    }
    res.json(books);
  })
})

app.delete('/books/:_id',function(req,res){
  var query = {_id : req.params._id};

  Books.remove(query,function(err,books){
    if(err){
      throw err;
    }
    res.json(books);
  })
})


app.put('/books/:_id',function(req,res){
  var book = req.body;
  var query = req.params._id;

  var update = {
    '$set' : {
      title : book.title,
      description : book.description,
      price : book.price,
      image : book.image
    }
  }

  var options = {new:true};

  Books.findOneAndUpdate(query,update,options,function(err,books){
    if(err){
      throw err;
    }
    res.json(books);
  })
})

//---------------------- images

app.get("/images",function(req,res){
  const imgFolder = __dirname + '/public/images/';
  const fs = require('fs');
  fs.readdir(imgFolder,function(err,files){
    if(err){
      throw err;
    }
    const fileArr = [];
    files.forEach(file => {
        fileArr.push({name : file});
    });

    res.json(fileArr);
  })
})



app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
