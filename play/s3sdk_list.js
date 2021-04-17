require('dotenv').config({ path: './config/config.env' });
const s3 = require('../util/aws/s3');
const s3ops = require('../util/aws/s3ops');

console.log('Using bucket', process.env.AWS_BUCKET);

// Call S3 to list the buckets
s3.listBuckets(function (err, data) {
  if (err) {
    console.log('Error', err);
  } else {
    console.log('list of buckets');
    console.log('Success', data.Buckets);
  }
});

const listContents = async () => {
  const summary = await s3ops.listBucketContents(false, 'space');
  console.log('contents of space folder');
  console.log(summary);
  return;
};

listContents();
