var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var indexRouter = require('./routes/index');
var personsRouter = require('./routes/persons');
var booksRouter = require('./routes/books'); 
var authorsRouter = require('./routes/authors');
var publishersRouter = require('./routes/publishers');
var ordersRouter = require('./routes/orders');
var cartItemsRouter = require('./routes/cart_items');
var publicationsRouter = require('./routes/publications');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/book_publishing', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(session({
  secret: "VERY_SECURE_SECRET",
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
})); 

app.use('/', indexRouter);
app.use('/api/persons', personsRouter);
app.use('/api/books', booksRouter);
app.use('/api/authors', authorsRouter);
app.use('/api/publishers', publishersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/cart_items', cartItemsRouter);
app.use('/api/publications', publicationsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
