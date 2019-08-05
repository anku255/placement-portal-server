const sgMail = require('@sendgrid/mail');
const { confirmEmailTemplate } = require('./templates/confirmEmail');
const { forgotPasswordTemplate } = require('./templates/forgotPassword');

exports.sendConfirmationMail = (hostUrl, userEmail, userName, token) => {
  sgMail.setApiKey(process.env.SENDGRID);
  const msg = {
    to: userEmail,
    from: 'noreply@placement-portal.com',
    subject: 'Placement Portal Email Verification',
    html: confirmEmailTemplate(hostUrl, userEmail, userName, token),
  };
  sgMail.send(msg);
};

exports.sendForgotPasswordMail = (hostUrl, userEmail, userName, token) => {
  sgMail.setApiKey(process.env.SENDGRID);
  const msg = {
    to: userEmail,
    from: 'noreply@placement-portal.com',
    subject: 'Placement Portal Password Recovery',
    html: forgotPasswordTemplate(hostUrl, userEmail, userName, token),
  };
  sgMail.send(msg);
};
