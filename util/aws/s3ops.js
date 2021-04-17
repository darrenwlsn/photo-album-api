const s3 = require('./s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const thumb = require('../../util/thumb');
// dgw const { createBucketIndex } = require('../../db/s3index-ops');
const md5 = require('md5');
const { urlencoded } = require('express');
const ErrorResponse = require('../../util/errorResponse');

const uploadFile = multer({
  storage: multerS3({
    s3: s3,
    acl: 'public-read',
    bucket: process.env.AWS_BUCKET,
    key: function (req, file, cb) {
      console.log(file);
      cb(null, file.originalname); //use Date.now() for unique file keys
    },
  }),
});

const downloadFile = async (fileName) => {
  return await downloadFileFromS3(fileName);
};

const downloadFileFromS3 = async (fileName) => {
  let params = {
    Bucket: process.env.AWS_BUCKET,
    Key: fileName,
  };

  const resp = new Promise((resolve, reject) => {
    s3.getObject(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
        // an error occurred
      } else {
        console.log(`retrieved data successfully from s3 for file ${fileName}`);
        //console.log(data); // successful response
        resolve(data);
      }
    });
  });
  return resp;
};

const uploadToS3 = async (req, res, next) => {
  // if (req.file && req.file.buffer && req.body.title) {
  if (req.file && req.file.buffer) {
    const origName = req.body.name;
    const folder = req.body.selectedFolder;
    const title = req.body.title;
    const caption = req.body.caption;
    const objKey = md5(origName + Date.now());
    var fileExt = '';
    switch (req.file.mimetype) {
      case 'image/jpeg': {
        fileExt = 'jpg';
        break;
      }
      case 'image/gif': {
        fileExt = 'gif';
        break;
      }
      case 'image/png': {
        fileExt = 'png';
        break;
      }
    }

    const thumbData = await thumb.createThumb(
      req.file.buffer.toString('base64')
    );

    // params for the thumb
    const paramsThumb = {
      ACL: 'public-read',
      Bucket: `${process.env.AWS_BUCKET}/${folder}`,
      Key: `thumb_${objKey}.${fileExt}`,
      Metadata: { origName: origName },
      Body: thumbData,
    };
    const paramsImage = {
      ACL: 'public-read',
      Bucket: `${process.env.AWS_BUCKET}/${folder}`,
      Key: `${objKey}.${fileExt}`,
      Metadata: { origName: origName },
      Body: req.file.buffer,
    };

    let result1 = await putS3File(paramsThumb);
    let result2 = await putS3File(paramsImage);
    if (
      result1 &&
      result2 &&
      result1.uploadStatus === 'ok' &&
      result2.uploadStatus === 'ok'
    ) {
      const idxData = {
        s3Bucket: process.env.AWS_BUCKET,
        userBucket: folder.substring(0, folder.indexOf('/')),
        userFolder: folder.substring(folder.indexOf('/') + 1),
        key: `https://s3.amazonaws.com/${process.env.AWS_BUCKET}/${folder}/${objKey}.${fileExt}`,
        title: title,
        caption: caption,
        keywords: [],
      };
      // dgw todo const indexResult = createBucketIndex(idxData);
      console.log('finished with index');
      result2[
        'url'
      ] = `https://${process.env.AWS_BUCKET}.s3-ap-southeast-2.amazonaws.com/${folder}/${objKey}.${fileExt}`;
      return result2;
    } else {
      return next(new ErrorResponse(`Error saving files to s3`, 500));
    }
  }
};

const putS3File = async (params) => {
  const putresult = await s3
    .putObject(params)
    .promise()
    .then((res) => {
      console.log(`Upload succeeded - `, res);
      return { uploadStatus: 'ok', ETag: res.ETag };
    })
    .catch((err) => {
      console.log('Upload failed:', err);
      return next(new ErrorResponse(`Error uploading file to s3`, 500));
    });
  console.log('have putresult', putresult);
  return putresult;
};

const retrieveDirectoryListing = async (showFolders, startFolder) => {
  return await listBucketContents(showFolders, startFolder);
};

const retrieveThumbs = async (startFolder) => {
  result = [];
  result = await listBucketContents(false, startFolder).then((data) => {
    return data.filter((item) => item.name.indexOf('thumb_') > -1);
  });
  return result;
};

const listBucketContents = async (showFolders, startFolder) => {
  let params = {
    Bucket: process.env.AWS_BUCKET,
    Prefix: startFolder ? startFolder : '',
    MaxKeys: 30,
  };

  return new Promise((resolve, reject) => {
    var files = s3.listObjects(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
        reject(err);
        // an error occurred
      } else {
        //console.log(data); // successful response

        const summary = data.Contents.filter((item) =>
          showFolders ? item.Size === 0 : item.Size > 0
        ).map((item) => {
          return {
            lastModified: item.LastModified,
            size: item.Size,
            name: showFolders
              ? item.Key.substring(0, item.Key.length - 1)
              : `https://s3.amazonaws.com/${process.env.AWS_BUCKET}/${item.Key}`,
          };
        });

        resolve(summary);
      }
    });
  });
};

module.exports = {
  uploadFile,
  downloadFile,
  uploadToS3,
  retrieveDirectoryListing,
  retrieveThumbs,
  listBucketContents,
};
