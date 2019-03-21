import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import {
  uploadToS3,
  isFileInS3,
  getSignedURL,
  getAllCVAsZip,
} from '../_helpers/aws';
import { userTypes } from '../constants';

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
 * @desc - route for getting a direct url for CV
 * @access - private
 */
router.get('/', getCV);
/**
 * @route - POST /api/cv/regNo/:regNo
 * @desc - route for getting direct Url for CV by regNo
 * @access - private
 */
router.get('/regNo/:regNo', getCVByRegNo);
/**
 * @route - POST /api/cv/all
 * @desc - route for getting all cvs as ZIP
 * @access - private
 */
router.get('/all', getAllCVsAsZip);

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
    };

    const hasUserUploadedCV = await isFileInS3(awsS3Params);

    if (hasUserUploadedCV) {
      const url = getSignedURL({
        ...awsS3Params,
        Expires: 60 /* link expires in 60 seconds */,
      });
      return res.json(url);
    }
    return res.status(400).json({ message: 'You have not uploaded your CV' });
  } catch (err) {
    return res.status(500).json({ type: 'miscellaneous', message: err });
  }
}

async function getCVByRegNo(req, res, next) {
  try {
    const { user } = req;
    const { regNo } = req.params;

    if (user.type !== userTypes.ADMIN) {
      return res
        .status(400)
        .json({ message: 'You are not allowed to perform this action' });
    }

    const awsS3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `cv/${Number(regNo)}.pdf`, // Casting to Number removes the preceding zeroes
    };

    const hasUserUploadedCV = await isFileInS3(awsS3Params);

    if (hasUserUploadedCV) {
      const url = getSignedURL({
        ...awsS3Params,
        Expires: 60 /* link expires in 60 seconds */,
      });
      return res.json(url);
    }
    return res.status(400).json({ message: 'User has not uploaded his CV.' });
  } catch (err) {
    return res.status(500).json({ type: 'miscellaneous', message: err });
  }
}

async function getAllCVsAsZip(req, res, next) {
  try {
    const { user } = req;

    if (user.type !== userTypes.ADMIN) {
      return res
        .status(400)
        .json({ message: 'You are not allowed to perform this action' });
    }

    const outputDir = 'zip/2020.zip'; // For 2020 Batch
    await getAllCVAsZip(outputDir);

    const url = getSignedURL({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: outputDir,
      Expires: 60 * 60, // 1 hour
    });

    return res.json(url);
  } catch (err) {
    return res.status(500).json({ type: 'miscellaneous', message: err });
  }
}

export default router;
