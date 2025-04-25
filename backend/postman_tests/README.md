# User Activation/Deactivation Testing Guide

This guide will help you test the user activation/deactivation functionality using the provided Postman collection.

## Setup

1. Make sure your backend server is running
2. Import the `user_activation_tests.postman_collection.json` file into Postman
3. If your backend API is not running at `http://localhost:3000/api`, update the `baseUrl` variable in the Postman collection settings

## Test Flow

The collection includes the following requests in the recommended testing order:

1. **Register Admin User** - Creates an admin user
2. **Register Regular User** - Creates a regular user
3. **Verify Admin Email** - You'll need to manually get the verification token
4. **Verify Regular User Email** - You'll need to manually get the verification token
5. **Admin Login** - Login as the admin user (stores the JWT token)
6. **Regular User Login** - Login as the regular user (stores the JWT token)
7. **Get All Users (Admin)** - View all users using the admin token
8. **Deactivate Regular User (Admin)** - Admin deactivates the regular user
9. **Try Login with Deactivated User** - Verify the deactivated user cannot login
10. **Reactivate Regular User (Admin)** - Admin reactivates the regular user
11. **Try Login with Reactivated User** - Verify the reactivated user can login
12. **Try to Deactivate User (Regular User - Should Fail)** - Regular user tries to deactivate another user

## Getting Verification Tokens

In a real test environment, you may need to get verification tokens from:
- Database directly
- Email service output (if configured to console)
- Server logs where email would be sent

For the tests, after registering each user, check your server's output for the verification tokens. Then set these Postman variables:
- `adminVerificationToken`: The token for the admin
- `regularUserVerificationToken`: The token for the regular user

## Notes

- The tests automatically set variables like `adminToken`, `regularUserToken`, `adminUserId`, and `regularUserId` when logging in
- The baseUrl is configured to `http://localhost:3000/api` by default

## Expected Results

- When attempting to login with a deactivated account, you should get an error message: "Account is inactive. Please contact an administrator"
- Regular users should not be able to deactivate other accounts
- Admin should be able to activate/deactivate any account 