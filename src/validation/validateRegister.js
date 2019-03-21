const validator = require('validator');

module.exports = function validateRegister(payload) {
  const errors = {};
  let isFormValid = true;

  if (
    !payload ||
    typeof payload.email !== 'string' ||
    !validator.isEmail(payload.email)
  ) {
    isFormValid = false;
    errors.email = 'Please provide a correct email address.';
  }

  if (
    !payload ||
    typeof payload.password !== 'string' ||
    payload.password.trim().length < 6
  ) {
    isFormValid = false;
    errors.password = 'Password must have at least 6 characters.';
  }

  if (
    !payload ||
    typeof payload.name !== 'string' ||
    payload.name.trim().length === 0
  ) {
    isFormValid = false;
    errors.name = 'Please provide your name.';
  }

  if (
    !payload ||
    typeof payload.regNo !== 'string' ||
    payload.regNo.trim().length < 7
  ) {
    isFormValid = false;
    errors.regNo = 'Please provide your 7 digit registration number.';
  }

  return {
    success: isFormValid,
    errors,
  };
};
