const s3 = require('../util/aws/s3');
const s3ops = require('../util/aws/s3ops');
const ErrorResponse = require('../util/errorResponse');
const asyncHandler = require('express-async-handler');

// @desc      Upload a file to S3
// @route     POST /api/v1/fileupload
// @access    Private/Admin
exports.uploadFile = asyncHandler(async (req, res, next) => {
  const result = await s3ops.uploadToS3(req, res, next);
  console.log('have result', result);
  if (result && result.uploadStatus === 'ok') {
    res.status(201).json({
      success: true,
      url: result.url,
    });
  }
});
