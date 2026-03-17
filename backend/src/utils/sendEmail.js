const transporter = require('../config/mail');

const sendEmail = async (options) => {
  // Helper for mock logging
  const logMockEmail = () => {
    console.log('⚠️ Email Sending Failed or Config Missing: Using Mock Mode');
    console.log('---------------------------------------------------');
    console.log(`📧 [MOCK EMAIL] To: ${options.to}`);
    console.log(`📧 [MOCK EMAIL] Subject: ${options.subject}`);
    const otpMatch = options.html.match(/\b\d{6}\b/);
    if (otpMatch) {
      console.log(`🔑 [MOCK OTP]: ${otpMatch[0]}`);
    }
    console.log('---------------------------------------------------');
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logMockEmail();
      return { success: false, error: 'Email configuration missing' };
    }

    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'SoloLearn Quiz'}" <${process.env.EMAIL_USER}>`,
      ...options
    });
    
    console.log(`📧 Email sent to ${options.to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    logMockEmail();
    return { success: false, error: error.message };
  }
};

const sendStartEmail = async (user, quizData, clientUrl) => {
  const subject = `🚀 Quiz Started: ${quizData.title}`;
  const playLink = `${clientUrl}/quizzes/${quizData.id}`;

  const html = `
    <div style="background-color: #030712; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 20px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
        <div style="background-color: #4f46e5; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Challenge Accepted!</h1>
        </div>
        <div style="padding: 40px; color: #94a3b8; line-height: 1.6;">
          <h2 style="color: #ffffff; margin-top: 0;">Hello ${user.name},</h2>
          <p>You have officially started the challenge: <span style="color: #818cf8; font-bold: bold;">${quizData.title}</span></p>
          <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #334155;">
            <p style="margin: 5px 0;"><strong>Category:</strong> ${quizData.category}</p>
            <p style="margin: 5px 0;"><strong>Started At:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>This is your journey to mastery. Stay focused and give it your best!</p>
          <div style="text-align: center; margin-top: 40px;">
            <a href="${playLink}" style="background-color: #4f46e5; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Resume Challenge</a>
          </div>
        </div>
        <div style="background-color: #1e293b; padding: 20px; text-align: center; border-top: 1px solid #334155;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} SoloLearn. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html
  });
};

const sendScorecardEmail = async (user, resultData, clientUrl) => {
  const {
    quizTitle,
    category,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    scorePercent,
    pointsEarned,
    coinsEarned = 0,
    badgesUnlocked = []
  } = resultData;

  const subject = `📊 Performance Report: ${quizTitle}`;
  const leaderboardLink = `${clientUrl}/leaderboard`;

  const html = `
    <div style="background-color: #030712; padding: 40px 20px; font-family: 'Segoe UI', sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 24px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
        <div style="background: linear-gradient(to right, #4f46e5, #7c3aed); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Challenge Summary</h1>
          <p style="color: #c4b5fd; margin-top: 8px; font-size: 16px;">Fantastic effort, ${user.name}!</p>
        </div>
        
        <div style="padding: 40px; color: #94a3b8;">
          <div style="text-align: center; margin-bottom: 35px;">
             <div style="display: inline-block; background-color: #1e293b; padding: 20px 40px; border-radius: 20px; border: 1px solid #334155;">
                <p style="margin: 0; font-size: 14px; text-transform: uppercase; tracking: 0.1em; color: #64748b;">Overall Accuracy</p>
                <h2 style="margin: 10px 0 0; color: #818cf8; font-size: 48px; font-weight: 900;">${scorePercent}%</h2>
             </div>
          </div>

          <table style="width: 100%; border-collapse: separate; border-spacing: 0 10px;">
            <tr>
              <td style="background-color: #1e293b; padding: 15px 20px; border-radius: 12px 0 0 12px; color: #cbd5e1;">Points Earned</td>
              <td style="background-color: #1e293b; padding: 15px 20px; border-radius: 0 12px 12px 0; text-align: right; color: #10b981; font-weight: 800; font-size: 18px;">+${pointsEarned}</td>
            </tr>
            <tr>
              <td style="background-color: #1e293b; padding: 15px 20px; border-radius: 12px 0 0 12px; color: #cbd5e1;">Coins Claimed</td>
              <td style="background-color: #1e293b; padding: 15px 20px; border-radius: 0 12px 12px 0; text-align: right; color: #f59e0b; font-weight: 800; font-size: 18px;">+${coinsEarned}</td>
            </tr>
            <tr>
              <td style="background-color: #1e293b; padding: 15px 20px; border-radius: 12px 0 0 12px; color: #cbd5e1;">Performance</td>
              <td style="background-color: #1e293b; padding: 15px 20px; border-radius: 0 12px 12px 0; text-align: right; color: #94a3b8; font-weight: bold;">${correctAnswers} / ${totalQuestions} Correct</td>
            </tr>
          </table>

          ${badgesUnlocked && badgesUnlocked.length > 0 ? `
            <div style="margin-top: 40px; text-align: center; background-color: rgba(251, 191, 36, 0.05); padding: 30px; border-radius: 20px; border: 1px dashed rgba(251, 191, 36, 0.3);">
              <p style="margin: 0 0 15px; color: #fbbf24; font-weight: 800; text-transform: uppercase; font-size: 13px; letter-spacing: 0.1em;">Achievements Unlocked</p>
              <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;">
                ${badgesUnlocked.map(b => `<span style="background-color: #fbbf24; color: #000; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; margin: 4px;">${b}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          <div style="text-align: center; margin-top: 45px;">
            <a href="${leaderboardLink}" style="background-color: #4f46e5; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 14px; font-weight: 800; display: inline-block; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);">View Rankings</a>
          </div>
        </div>
        
        <div style="background-color: #1e293b; padding: 25px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155;">
          Report generated on ${new Date().toLocaleDateString()} &bull; Keep Learning!
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html
  });
};

const sendResetEmail = async (user, resetUrl) => {
  const subject = '🔒 Password Reset Request';
  const html = `
    <div style="background-color: #030712; padding: 40px 20px; font-family: sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 20px; border: 1px solid #1e293b; overflow: hidden;">
        <div style="padding: 40px; color: #94a3b8; text-align: center;">
          <h2 style="color: #ffffff; margin-top: 0;">Account Recovery</h2>
          <p>Hello ${user.name}, you recently requested to reset your password. Click the button below to proceed:</p>
          <div style="margin: 35px 0;">
            <a href="${resetUrl}" style="background-color: #ef4444; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 13px;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #1e293b; font-size: 12px; color: #475569;">
            This security link will expire in 10 minutes.
          </div>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html
  });
};

const sendOtpEmail = async (email, otp) => {
  const subject = `🔑 ${otp} is your verification code`;
  const html = `
    <div style="background-color: #030712; padding: 40px 20px; font-family: 'Courier New', Courier, monospace;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #0f172a; border-radius: 20px; border: 1px solid #312e81; padding: 40px; text-align: center; box-shadow: 0 0 20px rgba(79, 70, 229, 0.1);">
        <h2 style="color: #ffffff; margin-bottom: 30px; font-family: sans-serif;">Security Verification</h2>
        <p style="color: #94a3b8; font-family: sans-serif;">Your authorization code is:</p>
        <div style="background-color: #1e293b; padding: 30px; border-radius: 15px; margin: 25px 0; border: 1px solid #4338ca;">
          <h1 style="color: #818cf8; margin: 0; font-size: 42px; letter-spacing: 12px; font-weight: bold;">${otp}</h1>
        </div>
        <p style="color: #64748b; font-size: 13px; font-family: sans-serif;">This code expires in 10 minutes. Never share this code with anyone.</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    html
  });
};

const sendCertificateEmail = async (user, pdfBuffer) => {
  const subject = 'Your Authentication Certificate';
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Hello ${user.name || 'User'},</h2>
      <p>Congratulations! You have successfully authenticated.</p>
      <p>Please find your certificate attached.</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
    attachments: [
      {
        filename: 'certificate.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });
};

module.exports = {
  sendEmail,
  sendStartEmail,
  sendScorecardEmail,
  sendResetEmail,
  sendOtpEmail,
  sendCertificateEmail
};
