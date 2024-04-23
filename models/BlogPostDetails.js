const mongoose = require('mongoose');

const blogPostDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  blogImage: {
    data: Buffer, // Store image data as a Buffer
    contentType: String, // Store content type (e.g., 'image/png', 'image/jpeg')
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
    type: String,
    trim: true,
  }
});

module.exports = mongoose.model('BlogPostDetails', blogPostDetailsSchema);