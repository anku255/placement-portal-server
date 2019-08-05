const expressJwt = require('express-jwt');

module.exports = jwt;

function jwt() {
  return expressJwt({ secret: process.env.SECRET_KEY }).unless({
    path: [
      // public routes that don't require authentication
      '/status',
      '/api/users/register',
      '/api/users/login',
      '/api/users/resendToken',
      '/api/users/forgotPassword',
      new RegExp('/api/users/confirmation/*'),
    ],
  });
}
