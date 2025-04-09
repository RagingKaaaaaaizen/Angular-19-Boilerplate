require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/error-handler');

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
  origin: process.env.FRONT_END_URL,
  credentials: true
}));

// API Routes
app.use('/accounts', require('./routes/account.routes'));

// Global error handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB', err);
    });
}

module.exports = app; 