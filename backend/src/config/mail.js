const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465,
  pool: true, // Enable connection pooling
  maxConnections: 5, // Limit concurrent connections
  maxMessages: 100, // Limit messages per connection
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ SMTP Connection Error:', error.message);
    if (error.message.includes('Username and Password not accepted')) {
      console.log('👉 TIP: If using Gmail, you MUST use an "App Password", not your login password.');
      console.log('   Go to: Google Account > Security > 2-Step Verification > App Passwords');
    }
  } else {
    console.log('✅ SMTP Server is ready to take our messages');
  }
});

module.exports = transporter;
