# Guru Academy Backend

This is the backend server for Guru Academy website with contact form email functionality.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the backend directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/guru_academy

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password_here

# Server Port
PORT=5000
```

### 3. Email Setup (Gmail)

To use Gmail for sending emails, you need to:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in the `EMAIL_PASS` variable

3. **Update .env file**:
   - Replace `your_gmail@gmail.com` with your actual Gmail address
   - Replace `your_app_password_here` with the generated app password

### 4. Start the Server
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Contact Form
- **POST** `/api/contact`
- Sends contact form data to your email and saves to database
- Required fields: `name`, `email`, `message`
- Optional fields: `phone`

## Features

- ✅ Contact form email notifications
- ✅ Database storage of contact submissions
- ✅ Admin authentication system
- ✅ CRUD operations for teachers, courses, materials, and toppers
- ✅ CORS enabled for frontend integration

## Troubleshooting

### Email not sending?
1. Check if Gmail app password is correct
2. Ensure 2-factor authentication is enabled
3. Check if the email address in .env matches your Gmail account

### Database connection issues?
1. Make sure MongoDB is running locally
2. Check the MONGODB_URI in .env file
3. Ensure the database name is correct 