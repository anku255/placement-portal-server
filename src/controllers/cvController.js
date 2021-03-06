import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import {
  uploadToS3,
  isFileInS3,
  getSignedURL,
  getAllCVAsZip,
  getMutlipleCVAsZip,
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

// GLOBAL Variable
let isUpdatedZipSavedInS3 = true;

/**
 * @route - POST /api/cv
 * @desc - route for uploading/updating a CV
 * @access - private
 */
router.post('/', uploadMiddleware, uploadCV);
/**
 * @route - GET /api/cv
 * @desc - route for getting a direct url for CV
 * @access - private
 */
router.get('/', getCV);

/**
 * @route - POST /api/cv/mulitple
 * @desc - route for getting mutlple cvs as a zip [for given reg numbers and batch year]
 * @access - private
 */
router.post('/multiple', getMultipleCVsAsZip);

/**
 * @route - GET /api/cv/batchYear/:batchYear/regNo/:regNo
 * @desc - route for getting direct Url for CV by regNo
 * @access - private
 */
router.get('/batchYear/:batchYear/regNo/:regNo', getCVYearAndRegNo);
/**
 * @route - GET /api/cv/all/batchYear/:batchYear
 * @desc - route for getting all cvs as ZIP
 * @access - private
 */
router.get('/all/batchYear/:batchYear', getAllCVsAsZip);

/**
 * @route - GET /api/cv/all/batchYear/:batchYear
 * @desc - route for getting all the users who have uploaded the cv
 * @access - private
 */
router.get('/all/users/batchYear/:batchYear', getAllUsersWithCV);

// Controllers
async function uploadCV(req, res, next) {
  try {
    const { user, file } = req;
    const fileName = file.originalname;
    const extension = fileName.split('.').pop();

    const awsS3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `cv/${user.batchYear}/${user.regNo}.${extension}`,
      Body: file.buffer,
    };

    const s3data = await uploadToS3(awsS3Params);

    /* eslint-disable-next-line */
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      $set: { hasUploadedCV: true },
    });

    // Generate ZIP
    isUpdatedZipSavedInS3 = false;

    const outputDir = `zip/${user.batchYear}.zip`;
    const prefix = `cv/${user.batchYear}`;
    getAllCVAsZip(prefix, outputDir, () => {
      isUpdatedZipSavedInS3 = true;
    });

    return res.json(s3data);
  } catch (err) {
    return res
      .status(500)
      .json({ type: 'miscellaneous', message: JSON.stringify(err) });
  }
}

async function getCV(req, res, next) {
  try {
    const { user } = req;

    const awsS3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `cv/${user.batchYear}/${user.regNo}.pdf`,
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
    return res
      .status(500)
      .json({ type: 'miscellaneous', message: JSON.stringify(err) });
  }
}

async function getCVYearAndRegNo(req, res, next) {
  try {
    const { user } = req;
    const { batchYear, regNo } = req.params;

    if (user.type !== userTypes.ADMIN) {
      return res
        .status(400)
        .json({ message: 'You are not allowed to perform this action' });
    }

    const awsS3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `cv/${batchYear}/${Number(regNo)}.pdf`, // Casting to Number removes the preceding zeroes
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
    return res
      .status(500)
      .json({ type: 'miscellaneous', message: JSON.stringify(err) });
  }
}

async function getAllCVsAsZip(req, res, next) {
  try {
    const { user } = req;
    const { batchYear } = req.params;

    if (user.type !== userTypes.ADMIN) {
      return res
        .status(400)
        .json({ message: 'You are not allowed to perform this action' });
    }

    const outputDir = `zip/${batchYear}.zip`;
    const prefix = `cv/${batchYear}`;

    if (!isUpdatedZipSavedInS3) {
      await getAllCVAsZip(prefix, outputDir, () => {
        isUpdatedZipSavedInS3 = true;
      });
    }

    const url = getSignedURL({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: outputDir,
      Expires: 60 * 60, // 1 hour
    });

    return res.json(url);
  } catch (err) {
    return res
      .status(500)
      .json({ type: 'miscellaneous', message: JSON.stringify(err.message) });
  }
}

async function getAllUsersWithCV(req, res, next) {
  try {
    const { user } = req;
    const { batchYear } = req.params;

    if (user.type !== userTypes.ADMIN) {
      return res
        .status(400)
        .json({ message: 'You are not allowed to perform this action' });
    }

    // query the database for users with batchYear and hasUploadedCV = true

    const usersWithCV = await User.find({
      type: userTypes.USER,
      batchYear,
      hasUploadedCV: true,
    })
      .select('name regNo -_id')
      .sort('regNo');

    return res.json(usersWithCV);
  } catch (err) {
    return res
      .status(500)
      .json({ type: 'miscellaneous', message: JSON.stringify(err.message) });
  }
}

async function getMultipleCVsAsZip(req, res, next) {
  try {
    const { user } = req;
    const { regNumbers, batchYear } = req.body;

    if (user.type !== userTypes.ADMIN) {
      return res
        .status(400)
        .json({ message: 'You are not allowed to perform this action' });
    }

    if (!regNumbers || !batchYear) {
      return res.status(400).json({
        message: 'Please provide a list of registration Numbers and batch Year',
      });
    }

    const outputDir = `zip/temp.zip`;
    const prefix = `cv/${batchYear}`;

    await getMutlipleCVAsZip(prefix, outputDir, regNumbers);

    const url = getSignedURL({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: outputDir,
      Expires: 60 * 60, // 1 hour
    });

    return res.json(url);
  } catch (err) {
    return res
      .status(500)
      .json({ type: 'miscellaneous', message: JSON.stringify(err.message) });
  }
}

export default router;
