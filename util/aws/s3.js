const AWS = require('aws-sdk');

// Set the credentials and region
AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESSKEY_ID,
  region: process.env.AWS_REGION,
});

AWS.config.getCredentials(function (err) {
  if (err) console.log(err.stack);
  // credentials not loaded
  else {
    console.log('Using Access key:', AWS.config.credentials.accessKeyId);
    console.log('Using bucket:', process.env.AWS_BUCKET);
  }
});

// Create S3 service object
s3 = new AWS.S3({ apiVersion: '2006-03-01' });

module.exports = s3;
