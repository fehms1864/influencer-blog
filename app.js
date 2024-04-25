var createError        = require('http-errors');
var express            = require('express');
const mongoose         = require('mongoose');
var path               = require('path');
var cookieParser       = require('cookie-parser');
var logger             = require('morgan');
var passport           = require('passport');
var Strategy           = require('passport-local').Strategy;
var RememberMeStrategy = require('passport-remember-me').Strategy;
const utils            = require('./routes/utils');
const https            = require('https');
const fs               = require('fs');
var indexRouter        = require('./routes/index');
var usersRouter        = require('./routes/users');

var tokens             = {}

function consumeRememberMeToken(token, fn) {
  var uid = tokens[token];
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
      
      usersRouter.findById(uid, function(err, user) {
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

// Load SSL certificate and key
const privateKey = fs.readFileSync('./server.key', 'utf8');
const certificate = fs.readFileSync('./server.cert', 'utf8');
const credentials = { key: privateKey, cert: certificate };

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

//Login and Logout
app.post('/signin', 
  passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }),
  function(req, res, next) {
    if (!req.body.remember_me) { return next(); }

    issueToken(req.user, function(err, token) {
      if (err) { return next(err); }
      res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
      return next();
    });
  },
  function(req, res) {
    res.redirect('/');
});

app.post('/signup', 
  function(req, res, next) {
    var newUser = {
      id: 0,
      username: req.body.username,
      password: req.body.password,
      displayName: req.body.displayName,
      email: req.body.email
    };
    usersRouter.addUser(newUser, function(err, user) {
      if (err) {
        return res.render('error', { message: 'Error creating user' });
      }
      next();
    });
  },
  function(req, res) {
    res.redirect('/signin');
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
mongoose.connect('mongodb://localhost:27017/BlogDatabase', options)
  .then(() => {
    console.log('Connected to the BlogDatabase');
  })
  .catch(error => {
    console.error('Error connecting to the BlogDatabase:', error);
  }
);

mongoose.connection
  .on('open', () => {
    console.log('Mongoose connection open');
  })
  .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
  });

require('./models/Contact');
require('./models/BlogPostDetails');

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Start the server
const PORT = process.env.PORT || 3000;
httpsServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
