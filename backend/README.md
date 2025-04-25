# Backend API with Ethereal Mail Integration

This is the backend API for the Angular authentication project using Ethereal Mail for email verification and password reset.

## Setup and Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Copy or rename `.env` file
   - Update MongoDB connection string and other variables as needed

3. Start the server:
   ```
   npm run dev
   ```

## Features

- User registration with email verification
- Authentication using JWT with refresh tokens
- Password reset functionality
- Role-based authorization
- Email notifications using Ethereal Mail

## How Ethereal Mail Works

Ethereal Mail is a fake SMTP service designed for testing email sending in applications. No real emails are sent. Instead, you get a preview URL to see the email that would have been sent.

### Testing Email Features

When you test registration or password reset:

1. The backend will create a temporary Ethereal Mail account
2. Send the email to the Ethereal service
3. Return a preview URL in the API response
4. You can view the email by clicking on the preview URL
5. User credentials for Ethereal Mail are also returned in the response

### Example Response

```json
{
  "message": "Registration successful, please check your email for verification instructions",
  "emailPreview": "https://ethereal.email/message/XYZ123",
  "etherealUser": "user@ethereal.email",
  "etherealPass": "password123"
}
```

### Production Use

For production, replace Ethereal Mail with a real email provider like:
- SendGrid
- Mailgun
- Amazon SES

Only minimal changes to the email service would be required. 