const express = require('express');
const multer = require('multer');
const { uploadFile } = require('../controllers/fileops');

const storage = multer.memoryStorage();
//const upload = multer({ dest: 'images/' });
const upload = multer({ storage: storage });

const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../middleware/auth');

// const advancedResults = require('../middleware/advancedResults');
// dgw todo const { protect, authorize } = require('../middleware/auth');

// dgw todo router.use(protect);
// dgw todo router.use(authorize('admin'));

router
  .route('/')
  .post(protect, authorize('user', 'admin'), upload.single('file'), uploadFile); // upload the file into memory and store in req.buffer before calling controller

module.exports = router;
