import mongoose from 'mongoose';
import express from 'express';
import jwt from 'jsonwebtoken';
import validateRegister from '../validation/validateRegister';
import validateLogin from '../validation/validateLogin';

const router = express.Router();
const User = mongoose.model('users');

// Routes
router.post('/register', register);
router.post('/login', login);
router.get('/current_user', getCurrentUser);

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
    return res.json({ message: 'Registration Successful!' });
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

function getCurrentUser(req, res, next) {
  return res.json(req.user);
}

export default router;
