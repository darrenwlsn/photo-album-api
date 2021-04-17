const mongoose = require('mongoose');

const S3IndexSchema = new mongoose.Schema({
  s3Bucket: {
    type: String,
    required: true,
    unique: false,
  },
  userBucket: {
    type: String,
    required: true,
    unique: false,
  },
  userFolder: {
    type: String,
    required: true,
    unique: false,
  },
  key: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: false,
  },
  caption: {
    type: String,
    required: false,
  },
  keywords: [
    {
      keyword: {
        type: String,
        required: false,
      },
    },
  ],
});

module.exports = mongoose.model('S3Index', S3IndexSchema);
