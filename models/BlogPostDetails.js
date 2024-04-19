const mongoose = require('mongoose');

const blogPostDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  blogImage: {
    type: String,
    trim: true
  },
  blogTitle: {
    type: String,
    trim: true,
  },
  blogMessage: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    trim: true,
  }
});

module.exports = mongoose.model('BlogPostDetails', blogPostDetailsSchema);