import mongoose from 'mongoose';
import express from 'express';
import jwt from 'jsonwebtoken';
import validateRegister from '../validation/validateRegister';

const router = express.Router();
const User = mongoose.model('users');

// Routes
router.post('/register', register);

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
    return res.status(500).json({ message: err });
  }
}

export default router;
