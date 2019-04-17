const validator = require('validator');

module.exports = function validateProfile(payload) {
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

  if (
    !payload ||
    typeof payload.batchYear !== 'string' ||
    payload.batchYear.trim().length === 0
  ) {
    isFormValid = false;
    errors.batchYear = 'Please provide your batch year.';
  }

  return {
    success: isFormValid,
    errors,
  };
};
