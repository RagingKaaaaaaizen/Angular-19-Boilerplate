const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, default: 'User' },
  verificationToken: String,
  verified: { type: Date },
  resetToken: {
    token: String,
    expires: Date
  },
  passwordReset: Date,
  created: { type: Date, default: Date.now },
  updated: Date
});

schema.virtual('isVerified').get(function () {
  return !!(this.verified || this.passwordReset);
});

schema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // Remove sensitive fields
    delete ret.passwordHash;
    delete ret.verificationToken;
    delete ret.resetToken;
  }
});

module.exports = mongoose.model('User', schema); 