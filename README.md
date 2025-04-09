# Angular Authentication with JSON Storage & Ethereal Mail

This project demonstrates a full-stack Angular application with authentication features including:
- User registration with email verification
- Login/logout functionality
- Password reset
- Role-based authorization

## Features

- Angular 17 frontend
- Node.js/Express backend
- JSON file storage (no database required)
- Ethereal Mail for email testing

## Quick Setup

1. **Install frontend dependencies**:
   ```
   npm i --legacy-peer-deps
   ```

2. **Install backend dependencies**:
   ```
   cd backend
   npm i
   cd ..
   ```

3. **Start both the frontend and backend together**:
   ```
   npm run start:all
   ```

4. **Or run them separately**:
   - Frontend: `npm start` (runs on http://localhost:4200)
   - Backend: `cd backend && npm run dev` (runs on http://localhost:4000)

## Email Verification with Ethereal Mail

When you register or reset your password, the application uses Ethereal Mail to simulate email sending without requiring a real email server.

1. After registration, check the backend console output for a Preview URL
2. Open this URL in your browser to view the email
3. Click on the verification link in the email to verify your account

## Environment Configuration

The application uses these default settings:

- Backend Port: 4000
- Frontend URL: http://localhost:4200
- JWT Secret: "your-secret-key" (change in production)
- JWT Expiry: 7 days

You can change these settings by modifying the `backend/.env` file.

## License

[MIT](LICENSE)

