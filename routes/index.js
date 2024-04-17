var express = require('express');
const mongoose = require('mongoose');
var router = express.Router();
const { check, validationResult } = require('express-validator');
exports.users = require('./users');

const { contactUsSchema } = require('../models/Contact');

const Contact = mongoose.model('Contact', contactUsSchema);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('blog', { title: 'Influence Blog', user: req.user });
});

router.get('/home', function (req, res, next) {
  res.render('blog', { title: 'Influence Blog', user: req.user });
});

router.get('/contact', (req, res) => {
  res.render('contactUs', { title: 'contactUs', user: req.user });
});

router.get('/signin', (req, res) => {
  res.render('signin', { title: 'Sign In' });
});

router.post('/submit',
  [
    check('name')
      .isLength({ min: 3 })
      .withMessage('Please enter a name'),
    check('email')
      .isLength({ min: 3 })
      .withMessage('Please enter an email'),
    check('message')
      .isLength({ min: 1 })
      .withMessage('Please enter your message'),
  ],
  async (req, res) => {
    //console.log(req.body);
    const errors = validationResult(req);
    console.log('req', req);
    console.log('errors',errors);

    if (errors.isEmpty()) {
      const contactUs = new Contact(req.body);
      contactUs.save()
        .then(() => {
          // res.render('thankyou', {
          //   title: 'Thank you Page',
          //   errors: errors.array(),
          //   data: req.body
          // });
          res.send('Form submitted successfully!');
        })
        .catch((err) => {
          console.log(err);
          res.send('Sorry! Something went wrong.');
        });
    } else {
      res.send('Sorryyyy');
      // res.render('register', {
      //   title: 'Registration form',
      //   errors: errors.array(),
      //   data: req.body,
      // });
    }
  });

module.exports = router;
