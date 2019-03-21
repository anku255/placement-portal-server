import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { uploadToS3, isFileInS3, getSignedURL } from '../_helpers/aws';

const router = express.Router();
const User = mongoose.model('users');

// Multer setup
const multerOptions = {
  storage: multer.memoryStorage(), // storing temporarily in memory
  fileFilter(req, file, next) {
    const isPDF = file.mimetype.startsWith('application/pdf');
    if (isPDF) {
      next(null, true);
    } else {
      next({ message: "That filetype isn't allowed!" }, false);
    }
  },
};

const uploadMiddleware = multer(multerOptions).single('file');

/**
 * @route - POST /api/cv
 * @desc - route for uploading/updating a CV
 * @access - private
 */
router.post('/', uploadMiddleware, uploadCV);
/**
 * @route - POST /api/cv
 * @desc - route for uploading/updating a CV
 * @access - private
 */
router.get('/', getCV);

// Controllers
async function uploadCV(req, res, next) {
  try {
    const { user, file } = req;
    const fileName = file.originalname;
    const extension = fileName.split('.').pop();

    const awsS3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `cv/${user.regNo}.${extension}`,
      Body: file.buffer,
    };

    const s3data = await uploadToS3(awsS3Params);

    /* eslint-disable-next-line */
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      $set: { hasUploadedCV: true },
    });

    return res.json(s3data);

    // TODO:
  } catch (err) {
    return res.status(500).json({ type: 'miscellaneous', message: err });
  }
}

async function getCV(req, res, next) {
  try {
    const { user } = req;

    const awsS3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `cv/${user.regNo}.pdf`,
      Expires: 60, // link expires in 60 seconds
    };

    const hasUserUploadedCV = await isFileInS3(awsS3Params);

    if (hasUserUploadedCV) {
      const url = getSignedURL(awsS3Params);
      return res.json(url);
    }
    return res.status(400).json({ message: 'You have not uploaded your CV' });
  } catch (err) {
    return res.status(500).json({ type: 'miscellaneous', message: err });
  }
}

export default router;
