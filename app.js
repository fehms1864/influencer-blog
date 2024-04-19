var createError = require('http-errors');
var express = require('express');
const mongoose = require('mongoose');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var RememberMeStrategy = require('passport-remember-me').Strategy;
const utils = require('./routes/utils');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var tokens = {}

function consumeRememberMeToken(token, fn) {
  var uid = tokens[token];
  // invalidate the single-use token
  delete tokens[token];
  return fn(null, uid);
}

function saveRememberMeToken(token, uid, fn) {
  tokens[token] = uid;
  return fn();
}

passport.use(new Strategy(
  function(username, password, cb) {
    usersRouter.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null,false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
}));

passport.use(new RememberMeStrategy(
  function(token, done) {
    consumeRememberMeToken(token, function(err, uid) {
      if (err) { return done(err); }
      if (!uid) { return done(null, false); }
      
      findById(uid, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user);
      });
    });
  },
  issueToken
));

function issueToken(user, done) {
  var token = utils.randomString(64);
  saveRememberMeToken(token, user.id, function(err) {
    if (err) { return done(err); }
    return done(null, token);
  });
}

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

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
//app.use('/users', usersRouter);

//Login and Logout
app.post('/signin', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res, next) {
    if (!req.body.remember_me) { return next(); }

    issueToken(req.user, function(err, token) {
      if (err) { return next(err); }
      res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 });
      return next();
    });
  },
  function(req, res) {
    res.redirect('/');
  });

app.get('/signout',
  function(req, res) {
    // clear the remember me cookie when logging out
    res.clearCookie('remember_me')
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
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

// Connect to the contactUs database
mongoose.connect('mongodb://localhost:27017/contactUs', options)
  .then(() => {
    console.log('Connected to the contactUs database');
  })
  .catch(error => {
    console.error('Error connecting to the contactUs database:', error);
  }
);

// Now connect to the blogPostDetails database
const blogPostDetailsConnection = mongoose.createConnection('mongodb://localhost:27017/blogPostDetails', options);

// Event listeners to log if connected successfully
blogPostDetailsConnection.on('connected', () => {
  console.log('Connected to the blogPostDetails database');
});

// Event listeners to log error if not connected
blogPostDetailsConnection.on('error', error => {
  console.error('Error connecting to the blogPostDetails database:', error);
});

mongoose.connection
  .on('open', () => {
    console.log('Mongoose connection open');
  })
  .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
  });

require('./models/Contact');
require('./models/BlogPostDetails');

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
