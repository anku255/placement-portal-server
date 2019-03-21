import express from 'express';
import multer from 'multer';
import { uploadToS3 } from '../_helpers/aws';

const router = express.Router();

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
    return res.json(s3data);

    // TODO:
  } catch (err) {
    return res.status(500).json({ type: 'miscellaneous', message: err });
  }
}

export default router;
