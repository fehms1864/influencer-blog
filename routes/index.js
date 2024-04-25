var express = require('express');
const mongoose = require('mongoose');
var router = express.Router();
const { check, validationResult } = require('express-validator');
exports.users = require('./users');

const { contactUsSchema } = require('../models/Contact');

const Contact = mongoose.model('Contact', contactUsSchema);

const { blogPostDetailsSchema } = require('../models/BlogPostDetails');

const BlogPostDetails = mongoose.model('BlogPostDetails', blogPostDetailsSchema);

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

router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up' });
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

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      const contactUs = new Contact(req.body);
      contactUs.save()
        .then(() => {
          res.send('Form submitted successfully!');
        })
        .catch((err) => {
          console.log(err);
          res.send('Sorry! Something went wrong.');
        });
    } else {
      res.send('Sorryyyy');
    }
  }
);

router.post('/submit-blog',
  [
    check('blogImage')
      .isLength({ min: 3 })
      .withMessage('Please enter an image url'),
    check('blogTitle')
      .isLength({ min: 1 })
      .withMessage('Please enter a blog title'),
    check('blogMessage')
      .isLength({ min: 3 })
      .withMessage('Please enter a blog message'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    console.log('req is here', req.body);
    console.log('errors',errors);

    if (errors.isEmpty()) {
      const details = new BlogPostDetails(req.body);
      details.save()
        .then(() => {
          res.send('Form submitted successfully!');
        })
        .catch((err) => {
          console.log(err);
          res.send('Sorry! Something went wrong while saving blog!');
        });
    } else {
      res.send('Sorryyyy blog was not saved');
    }
  }
);

module.exports = router;
