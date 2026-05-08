const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { uploadToCloudinary } = require('../utils/cloudinary');
const asyncHandler = require('express-async-handler');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'), false);
    }
  },
});

router.post('/', protect, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image');
  }

  try {
    const result = await uploadToCloudinary(req.file.buffer);
    res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500);
    throw new Error('Image upload failed');
  }
}));

module.exports = router;
