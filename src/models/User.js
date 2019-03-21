import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';
import { userTypes } from '../constants';

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: [userTypes.USER, userTypes.ADMIN],
    default: userTypes.USER,
  },
  regNo: {
    type: Number,
    required: true,
    unique: true,
  },
});

/* eslint-disable-next-line */
userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(5, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods = {
  comparePassword(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) return cb(err);
      cb(null, isMatch);
    });
  },
};

mongoose.model('users', userSchema);
