const nodemailer = require('nodemailer');
const config = require('../config/config');

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAlreadyRegisteredEmail,
  sendPasswordChangedEmail
};

async function getTransporter() {
  // Create a test account with Ethereal
  const testAccount = await nodemailer.createTestAccount();

  // Create a transporter using Ethereal Mail
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  return { transporter, testAccount };
}

async function sendEmail(to, subject, html, text) {
  const { transporter, testAccount } = await getTransporter();

  const mailOptions = {
    from: '"Your App" <no-reply@yourapp.com>',
    to,
    subject,
    text,
    html
  };

  const info = await transporter.sendMail(mailOptions);
  
  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  
  // Return the preview URL for testing purposes
  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info),
    etherealUser: testAccount.user,
    etherealPass: testAccount.pass
  };
}

async function sendVerificationEmail(to, token) {
  const subject = 'Please verify your email address';
  const verifyUrl = `${config.frontend.url}/account/verify-email?token=${token}`;
  const html = `
    <h1>Email Verification</h1>
    <p>Thank you for registering!</p>
    <p>Please click the link below to verify your email address:</p>
    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p>If you did not request this email, please ignore it.</p>
  `;
  const text = `
    Email Verification
    
    Thank you for registering!
    
    Please click the link below to verify your email address:
    ${verifyUrl}
    
    If you did not request this email, please ignore it.
  `;

  return await sendEmail(to, subject, html, text);
}

async function sendAlreadyRegisteredEmail(to, token) {
  const subject = 'Email Already Registered';
  const verifyUrl = `${config.frontend.url}/account/verify-email?token=${token}`;
  const html = `
    <h1>Email Already Registered</h1>
    <p>Your email <strong>${to}</strong> is already registered.</p>
    <p>If you don't know your password you can <a href="${config.frontend.url}/account/forgot-password">reset it here</a>.</p>
    <p>If you haven't verified your email yet, please click the link below:</p>
    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
  `;
  const text = `
    Email Already Registered
    
    Your email ${to} is already registered.
    
    If you don't know your password you can reset it here: ${config.frontend.url}/account/forgot-password
    
    If you haven't verified your email yet, please click the link below:
    ${verifyUrl}
  `;

  return await sendEmail(to, subject, html, text);
}

async function sendPasswordResetEmail(to, token) {
  const subject = 'Reset Your Password';
  const resetUrl = `${config.frontend.url}/account/reset-password?token=${token}`;
  const html = `
    <h1>Reset Password</h1>
    <p>Please click the link below to reset your password:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>If you did not request this email, please ignore it.</p>
  `;
  const text = `
    Reset Password
    
    Please click the link below to reset your password:
    ${resetUrl}
    
    If you did not request this email, please ignore it.
  `;

  return await sendEmail(to, subject, html, text);
}

async function sendPasswordChangedEmail(to) {
  const subject = 'Your Password Has Been Changed';
  const html = `
    <h1>Password Changed</h1>
    <p>Your password has been changed successfully.</p>
    <p>If you did not change your password, please contact support immediately.</p>
  `;
  const text = `
    Password Changed
    
    Your password has been changed successfully.
    
    If you did not change your password, please contact support immediately.
  `;

  return await sendEmail(to, subject, html, text);
} 