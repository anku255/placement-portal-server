import mongoose from 'mongoose';
import express from 'express';
import { userTypes } from '../constants';

const router = express.Router();
const Notice = mongoose.model('notices');

// Routes
router.get('/', getNotices);
router.post('/', addNotice);
router.put('/:noticeId', updateNotice);

// Controllers

async function getNotices(req, res) {
  try {
    let { page = 1 } = req.query;
    const NOTICE_PER_PAGE = 10;

    const limit = NOTICE_PER_PAGE;
    let skip = page * limit - limit;

    const noticePromise = Notice.find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 'desc' });

    const countPromise = Notice.count({});

    // eslint-disable-next-line
    let [notices, count] = await Promise.all([noticePromise, countPromise]);

    const pages = Math.ceil(count / limit);

    // Page no exceeded than highest page no.
    if (!notices.length && skip) {
      // set page to last page no
      page = pages;
      skip = page * limit - limit;

      notices = await Notice.find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: 'desc' });

      return res.json({ notices, pages });
    }

    return res.json({ notices, pages });
  } catch (err) {
    return res
      .status(500)
      .json({ type: 'miscellaneous', message: JSON.stringify(err.message) });
  }
}

async function addNotice(req, res) {
  try {
    const { user } = req;
    if (user.type !== userTypes.ADMIN) {
      return res
        .status(400)
        .json({ message: 'You are not allowed to perform this action' });
    }

    const { deadline, contentMarkdown } = req.body;

    if (!deadline || !contentMarkdown) {
      return res.status(400).json({
        message: 'Please provide both deadline and content for the notice',
      });
    }

    const notice = await new Notice({ deadline, contentMarkdown }).save();

    return res.json({ notice });
  } catch (err) {
    return res
      .status(500)
      .json({ type: 'miscellaneous', message: JSON.stringify(err.message) });
  }
}

async function updateNotice(req, res) {
  try {
    const { user } = req;
    if (user.type !== userTypes.ADMIN) {
      return res
        .status(400)
        .json({ message: 'You are not allowed to perform this action' });
    }

    const { deadline, contentMarkdown } = req.body;

    if (!deadline || !contentMarkdown) {
      return res.status(400).json({
        message: 'Please provide both deadline and content for the notice',
      });
    }

    const { noticeId } = req.params;

    const notice = await Notice.findById(noticeId);

    notice.deadline = deadline;
    notice.contentMarkdown = contentMarkdown;

    await notice.save();

    return res.json({ notice });
  } catch (err) {
    return res
      .status(500)
      .json({ type: 'miscellaneous', message: JSON.stringify(err.message) });
  }
}

export default router;
