var express = require('express');
const mongoose = require('mongoose');
var router = express.Router();
const { check, validationResult } = require('express-validator');
exports.users = require('./users');
//used to save image in db
const multer = require('multer');

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { contactUsSchema } = require('../models/Contact');

const Contact = mongoose.model('Contact', contactUsSchema);

const { blogPostDetailsSchema } = require('../models/BlogPostDetails');

const BlogPostDetails = mongoose.model('BlogPostDetails', blogPostDetailsSchema);

function formatDate(date) {
  const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleDateString('en-US', options);
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  const blogs = await BlogPostDetails.find()

  // Convert the image data to base64 string and store it
  const blogsWithImageData = (blogs.map((blog) => {
    const base64ImageData = blog.blogImage && blog.blogImage.data ? blog.blogImage.data.toString('base64') : null;
    return {
      ...blog.toObject(), // Convert Mongoose document to plain JavaScript object
      blogImageBase64: base64ImageData, // Add base64 image data to the blog post object
    };
  }));

  res.render('blog', { title: 'Influence Blog', user: req.user, blogs: blogsWithImageData });

  console.log("blogs are: ", blogsWithImageData);
  // res.render('blog', { title: 'Influence Blog', user: req.user });
});

router.get('/home', function (req, res, next) {
  res.render('blog', { title: 'Influence Blog', user: req.user });
});

router.get('/contact', (req, res) => {
  res.render('contactUs', { title: 'Contact Us', user: req.user });
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

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      const contactUs = new Contact(req.body);
      contactUs.save()
        .then(() => {
          res.redirect('/');
        })
        .catch((err) => {
          console.log(err);
          res.send('Sorry! Something went wrong while sending your message.');
        });
    } else {
      res.send('Sorry! messeage was not submitted');
    }
  }
);

router.post('/submit-blog', upload.single('blogImage'),
  [
    check('blogImage')
      .custom((value, { req }) => {
        if (!req.file) {
          throw new Error('Please upload an image');
        }
        return true;
      }),
    check('blogTitle')
      .isLength({ min: 1 })
      .withMessage('Please enter a blog title'),
    check('blogMessage')
      .isLength({ min: 3 })
      .withMessage('Please enter a blog message'),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty() || req.fileValidationError == undefined) {
      const details = new BlogPostDetails({
        name: req.user.displayName,
        date: formatDate(new Date()),
        blogTitle: req.body.blogTitle,
        blogMessage: req.body.blogMessage,
        blogImage: {
          data: req.file.buffer, // Store image data as a buffer
          contentType: req.file.mimetype, // Store content type
        },
      });
      details.save()
        .then(() => {
          res.redirect('/');
        })
        .catch((err) => {
          console.log(err);
          res.send('Sorry! Something went wrong while saving blog!');
        });
    } else {
      res.send('Sorry blog was not saved');
    }
  }
);

module.exports = router;
