var createError = require('http-errors');
var express = require('express');
const mongoose = require('mongoose');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

passport.use(new Strategy(
  function(username, password, cb) {
    usersRouter.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null,false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
}));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  usersRouter.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'nobody knows', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
//app.use('/users', usersRouter);

//Login and Logout
app.post('/signin',
  passport.authenticate('local', { failureRedirect: '/signin'}),
  function(req, res) {
    res.redirect('/');
});

app.get('/signout',
  function(req, res) {
    req.logout();
    res.redirect('/');
});

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

//MONGOOSE CONNECTION
mongoose.connect('mongodb://localhost:27017/contactUs', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection
  .on('open', () => {
    console.log('Mongoose connection open');
  })
  .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
  });

require('./models/Contact');

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
