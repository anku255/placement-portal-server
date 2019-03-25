import mongoose from 'mongoose';
import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import validateRegister from '../validation/validateRegister';
import validateLogin from '../validation/validateLogin';

import { sendConfirmationMail } from '../_helpers/sendgrid';

const router = express.Router();
const User = mongoose.model('users');
const Token = mongoose.model('tokens');

// Routes
router.post('/register', register);
router.post('/login', login);
router.post('/current_user', getCurrentUser);
router.get('/confirmation/:token', confirmEmail);
router.post('/resendToken', resendToken);

// Controllers

async function register(req, res, next) {
  const validationResult = validateRegister(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      type: 'validation',
      errors: validationResult.errors,
    });
  }

  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        type: 'validation',
        errors: { email: 'Email already in use' },
      });
    }

    const user = await new User(req.body).save();
    const token = await new Token({
      _userId: user._id,
      token: crypto.randomBytes(16).toString('hex'),
    }).save();

    sendConfirmationMail(req.headers.host, user.email, user.name, token.token);

    return res.json({
      message: `A verification mail has been sent to ${user.email}`,
    });
  } catch (err) {
    return res.status(500).json({ message: JSON.stringify(err) });
  }
}

async function login(req, res, next) {
  try {
    const validationResult = validateLogin(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        type: 'validation',
        errors: validationResult.errors,
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user.isVerified) {
      return res.status(400).json({
        type: 'not-verified',
        message: 'Your account has not been verified.',
      });
    }

    user.comparePassword(password, (err, isMatch) => {
      if (isMatch) {
        const { password: pass, ...userWithoutPassword } = user.toObject();
        const token = jwt.sign(userWithoutPassword, process.env.SECRET_KEY, {
          expiresIn: 60 * 60 * 24 * 30, // 30 days
        });
        return res.json({
          ...userWithoutPassword,
          token: `Bearer ${token}`,
        });
      }
      return res.status(400).json({
        type: 'validation',
        errors: { password: 'Incorrect Password!' },
      });
    });
  } catch (error) {
    return res
      .status(400)
      .json({ type: 'miscellaneous', message: JSON.stringify(error) });
  }
}

async function getCurrentUser(req, res, next) {
  const user = await User.findById(req.user._id);
  const { password, ...userWithoutPassword } = user.toObject();
  const token = jwt.sign(userWithoutPassword, process.env.SECRET_KEY, {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  });

  return res.json({ token: `Bearer ${token}` });
}

async function confirmEmail(req, res, next) {
  try {
    const token = await Token.findOne({ token: req.params.token });
    if (!token) {
      return res.status(400).json({
        type: 'not-verified',
        message:
          'We were unable to find a valid token. Your token my have expired.',
      });
    }

    const user = await User.findById(token._userId);
    if (!user) {
      return res
        .status(400)
        .json({ message: 'We were unable to find a user for this token.' });
    }

    if (user.isVerified)
      return res.status(400).json({
        type: 'already-verified',
        message: 'This user has already been verified.',
      });

    user.isVerified = true;
    await user.save();
    return res.json({
      message: 'The account has been verified. Please log in.',
    });
  } catch (error) {
    return res.status(400).json({ message: JSON.stringify(error) });
  }
}

async function resendToken(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'We were unable to find a user with that email.',
      });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: 'This account has already been verified' });
    }

    const token = await new Token({
      _userId: user._id,
      token: crypto.randomBytes(16).toString('hex'),
    }).save();

    sendConfirmationMail(req.headers.host, user.email, user.name, token.token);
    console.log('sending success');
    return res.json({
      success: true,
      message: `A verification mail has been sent to ${user.email}`,
    });
  } catch (error) {
    console.log('sending error', error);
    return res.status(400).json({ message: JSON.stringify(error) });
  }
}

export default router;
