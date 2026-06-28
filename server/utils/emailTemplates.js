export const welcomeEmail = (user) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f8f9fa; color: #191c1d; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background-color: #1A1A1A; padding: 30px; text-align: center; }
          .header h1 { color: #AAEE00; margin: 0; font-size: 28px; font-weight: 800; }
          .content { padding: 40px 30px; }
          .content h2 { font-size: 22px; margin-top: 0; font-weight: 700; color: #1A1A1A; }
          .content p { font-size: 16px; line-height: 24px; color: #5f5e5e; }
          .steps { margin: 25px 0; padding: 0; list-style-type: none; }
          .steps li { font-size: 15px; margin-bottom: 12px; position: relative; padding-left: 24px; color: #191c1d; }
          .steps li::before { content: '✓'; color: #AAEE00; font-weight: bold; position: absolute; left: 0; }
          .btn-container { text-align: center; margin-top: 30px; }
          .btn { background-color: #AAEE00; color: #1A1A1A; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 16px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #edeeef; }
          .footer p { font-size: 12px; color: #c8c6c5; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TurfBook</h1>
          </div>
          <div class="content">
            <h2>Welcome to the Arena, ${user.name}!</h2>
            <p>We are excited to welcome you to TurfBook – the premium slot booking platform for sports lovers. Whether you are playing football, cricket, basketball, or tennis, we've got the perfect pitch for your game.</p>
            <p>Get started today in 3 easy steps:</p>
            <ul class="steps">
              <li>Explore premium turfs in your city.</li>
              <li>Pick a convenient date and time slot.</li>
              <li>Book instantly and enjoy the match!</li>
            </ul>
            <div class="btn-container">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="btn">Browse Turfs</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TurfBook. All rights reserved.</p>
            <p>If you have any questions, contact us at support@turfbook.com</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const resetPasswordEmail = (user, resetUrl) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f8f9fa; color: #191c1d; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background-color: #1A1A1A; padding: 30px; text-align: center; }
          .header h1 { color: #AAEE00; margin: 0; font-size: 28px; font-weight: 800; }
          .content { padding: 40px 30px; }
          .content h2 { font-size: 22px; margin-top: 0; font-weight: 700; color: #1A1A1A; }
          .content p { font-size: 16px; line-height: 24px; color: #5f5e5e; }
          .btn-container { text-align: center; margin-top: 35px; }
          .btn { background-color: #AAEE00; color: #1A1A1A; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 16px; }
          .warning { margin-top: 25px; padding: 15px; background-color: #ffdad6; border-left: 4px solid #ba1a1a; border-radius: 6px; }
          .warning p { color: #ba1a1a; margin: 0; font-size: 14px; font-weight: 500; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #edeeef; }
          .footer p { font-size: 12px; color: #c8c6c5; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TurfBook</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>Hello ${user.name},</p>
            <p>You are receiving this email because you (or someone else) requested a password reset for your TurfBook account.</p>
            <p>Please click the button below to set a new password:</p>
            <div class="btn-container">
              <a href="${resetUrl}" class="btn">Reset Password</a>
            </div>
            <div class="warning">
              <p>⚠️ This link will expire in 15 minutes. If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TurfBook. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const resetPasswordOTPEmail = (user, otpCode) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f8f9fa; color: #191c1d; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background-color: #1A1A1A; padding: 30px; text-align: center; }
          .header h1 { color: #AAEE00; margin: 0; font-size: 28px; font-weight: 800; }
          .content { padding: 40px 30px; }
          .content h2 { font-size: 22px; margin-top: 0; font-weight: 700; color: #1A1A1A; }
          .content p { font-size: 16px; line-height: 24px; color: #5f5e5e; }
          .otp-container { text-align: center; margin: 30px 0; }
          .otp-code { background-color: #f1f5f9; color: #1a1a1a; font-size: 32px; font-weight: 800; letter-spacing: 6px; padding: 16px 32px; border-radius: 12px; display: inline-block; border: 1px solid #e2e8f0; }
          .warning { margin-top: 25px; padding: 15px; background-color: #ffdad6; border-left: 4px solid #ba1a1a; border-radius: 6px; }
          .warning p { color: #ba1a1a; margin: 0; font-size: 14px; font-weight: 500; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #edeeef; }
          .footer p { font-size: 12px; color: #c8c6c5; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TurfBook</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>Hello ${user.name},</p>
            <p>You requested to reset your password for your TurfBook account. Use the 6-digit verification code below to proceed:</p>
            <div class="otp-container">
              <span class="otp-code">${otpCode}</span>
            </div>
            <div class="warning">
              <p>⚠️ This code will expire in 15 minutes. If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TurfBook. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const bookingConfirmationEmail = (booking, user, turf) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f8f9fa; color: #191c1d; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background-color: #1A1A1A; padding: 30px; text-align: center; }
          .header h1 { color: #AAEE00; margin: 0; font-size: 28px; font-weight: 800; }
          .content { padding: 40px 30px; }
          .content h2 { font-size: 22px; margin-top: 0; font-weight: 700; color: #1A1A1A; text-align: center; }
          .success-badge { background-color: #aaee00; color: #1a1a1a; display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 14px; margin: 10px auto; text-align: center; }
          .badge-container { text-align: center; margin-bottom: 25px; }
          .details-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
          .details-table th, .details-table td { padding: 14px; text-align: left; border-bottom: 1px solid #edeeef; }
          .details-table th { color: #5f5e5e; font-weight: 600; width: 40%; font-size: 15px; }
          .details-table td { color: #191c1d; font-weight: 700; font-size: 15px; }
          .btn-container { text-align: center; margin-top: 30px; }
          .btn { background-color: #AAEE00; color: #1A1A1A; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 16px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #edeeef; }
          .footer p { font-size: 12px; color: #c8c6c5; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TurfBook</h1>
          </div>
          <div class="content">
            <h2>Your Booking is Confirmed!</h2>
            <div class="badge-container">
              <span class="success-badge">Game Ready ✓</span>
            </div>
            <p>Hi ${user.name}, your reservation at <strong>${turf.name}</strong> has been successfully booked. Below are your booking details:</p>
            
            <table class="details-table">
              <tr>
                <th>Booking ID</th>
                <td>${booking.bookingId}</td>
              </tr>
              <tr>
                <th>Venue</th>
                <td>${turf.name}</td>
              </tr>
              <tr>
                <th>Date</th>
                <td>${booking.date}</td>
              </tr>
              <tr>
                <th>Time Slot</th>
                <td>${booking.startTime} - ${booking.endTime} (${booking.duration} hr)</td>
              </tr>
              <tr>
                <th>Sport</th>
                <td style="text-transform: capitalize;">${booking.sport}</td>
              </tr>
              <tr>
                <th>Total Paid</th>
                <td>₹${booking.totalAmount}</td>
              </tr>
            </table>

            <div class="btn-container">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="btn">View Bookings</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TurfBook. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const applicationReceivedEmail = (applicantName, applicationId, turfName) => {
  const statusLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/become-partner/status?id=${applicationId}`;
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f8f9fa; color: #191c1d; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background-color: #1A1A1A; padding: 30px; text-align: center; }
          .header h1 { color: #AAEE00; margin: 0; font-size: 28px; font-weight: 800; }
          .content { padding: 40px 30px; }
          .content h2 { font-size: 22px; margin-top: 0; font-weight: 700; color: #1A1A1A; }
          .content p { font-size: 16px; line-height: 24px; color: #5f5e5e; }
          .id-box { background-color: #f1f5f9; border-left: 4px solid #AAEE00; padding: 15px; margin: 20px 0; border-radius: 6px; }
          .id-box p { margin: 0; font-size: 14px; color: #1e293b; font-weight: 700; }
          .id-val { font-size: 20px; color: #1A1A1A; font-family: monospace; display: block; margin-top: 5px; }
          .btn-container { text-align: center; margin-top: 30px; }
          .btn { background-color: #AAEE00; color: #1A1A1A; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 16px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #edeeef; }
          .footer p { font-size: 12px; color: #c8c6c5; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TurfBook</h1>
          </div>
          <div class="content">
            <h2>Application Received!</h2>
            <p>Dear ${applicantName},</p>
            <p>Thank you for submitting your partner application to list <strong>${turfName}</strong> on TurfBook. We are excited about the possibility of partnering with you.</p>
            
            <div class="id-box">
              <p>YOUR APPLICATION ID:</p>
              <span class="id-val">${applicationId}</span>
            </div>

            <p>Our verification team will review your credentials and turf details within <strong>24 to 48 hours</strong>. You can track your application status anytime using the link below:</p>
            
            <div class="btn-container">
              <a href="${statusLink}" class="btn">Check Application Status</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TurfBook. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const applicationApprovedEmail = (ownerName, turfName, loginEmail, generatedPassword, ownerPanelUrl) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f8f9fa; color: #191c1d; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background-color: #AAEE00; padding: 35px 30px; text-align: center; }
          .header h1 { color: #1A1A1A; margin: 0; font-size: 28px; font-weight: 900; }
          .content { padding: 40px 30px; }
          .content h2 { font-size: 22px; margin-top: 0; font-weight: 700; color: #1A1A1A; }
          .content p { font-size: 16px; line-height: 24px; color: #5f5e5e; }
          .credentials-box { background-color: #1A1A1A; color: #ffffff; padding: 20px; margin: 25px 0; border-radius: 10px; border-left: 4px solid #AAEE00; }
          .credentials-box h3 { margin-top: 0; margin-bottom: 15px; font-size: 14px; text-transform: uppercase; tracking-wider; color: #AAEE00; }
          .cred-row { margin-bottom: 10px; font-size: 15px; }
          .cred-row strong { color: #cfcfcf; }
          .cred-val { font-family: monospace; font-weight: bold; color: #AAEE00; font-size: 16px; }
          .warning { padding: 15px; background-color: #fffbeb; border-left: 4px solid #d97706; border-radius: 6px; margin-top: 25px; }
          .warning p { color: #b45309; margin: 0; font-size: 13px; font-weight: 600; }
          .btn-container { text-align: center; margin-top: 30px; }
          .btn { background-color: #AAEE00; color: #1A1A1A; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 16px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #edeeef; }
          .footer p { font-size: 12px; color: #c8c6c5; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Approved!</h1>
          </div>
          <div class="content">
            <h2>Welcome to the TurfBook Network, ${ownerName}!</h2>
            <p>We are thrilled to inform you that your application for <strong>${turfName}</strong> has been approved. Your venue listing is now officially live on TurfBook!</p>
            
            <p>An owner account has been generated for you. Use the temporary credentials below to log in:</p>
            
            <div class="credentials-box">
              <h3>Your Login Credentials</h3>
              <div class="cred-row"><strong>Email:</strong> ${loginEmail}</div>
              <div class="cred-row"><strong>Password:</strong> <span class="cred-val">${generatedPassword}</span></div>
            </div>

            <div class="warning">
              <p>🔒 Security Reminder: You will be prompted to set a new, secure password immediately upon your first login.</p>
            </div>

            <div class="btn-container">
              <a href="${ownerPanelUrl}" class="btn">Login to Owner Panel</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TurfBook. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const applicationRejectedEmail = (applicantName, turfName, rejectionReason) => {
  const reapplyLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/become-partner/apply`;
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f8f9fa; color: #191c1d; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background-color: #ba1a1a; padding: 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; }
          .content { padding: 40px 30px; }
          .content h2 { font-size: 22px; margin-top: 0; font-weight: 700; color: #1A1A1A; }
          .content p { font-size: 16px; line-height: 24px; color: #5f5e5e; }
          .reason-box { background-color: #f8fafc; border-left: 4px solid #64748b; padding: 16px; margin: 20px 0; border-radius: 8px; }
          .reason-box p { margin: 0; font-size: 14px; color: #475569; font-weight: 550; line-height: 20px; }
          .btn-container { text-align: center; margin-top: 30px; }
          .btn { background-color: #64748b; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 15px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #edeeef; }
          .footer p { font-size: 12px; color: #c8c6c5; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Update</h1>
          </div>
          <div class="content">
            <h2>Dear ${applicantName},</h2>
            <p>Thank you for your interest in listing <strong>${turfName}</strong> on the TurfBook platform. Our onboarding team has carefully evaluated your submission.</p>
            <p>Unfortunately, we are unable to approve your listing application at this time due to the following reason(s):</p>
            
            <div class="reason-box">
              <p>${rejectionReason}</p>
            </div>

            <p>If you believe this was in error, or once you have updated the necessary details, you are welcome to submit a new application here:</p>
            
            <div class="btn-container">
              <a href="${reapplyLink}" class="btn">Re-apply Now</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TurfBook. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const applicationMoreInfoEmail = (applicantName, turfName, infoNeeded) => {
  const statusLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/become-partner/status`;
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f8f9fa; color: #191c1d; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background-color: #FFD700; padding: 30px; text-align: center; }
          .header h1 { color: #1A1A1A; margin: 0; font-size: 26px; font-weight: 800; }
          .content { padding: 40px 30px; }
          .content h2 { font-size: 22px; margin-top: 0; font-weight: 700; color: #1A1A1A; }
          .content p { font-size: 16px; line-height: 24px; color: #5f5e5e; }
          .info-box { background-color: #fffbeb; border-left: 4px solid #FFD700; padding: 18px; margin: 20px 0; border-radius: 8px; color: #1A1A1A; }
          .info-box p { margin: 0; font-size: 14px; font-weight: 600; line-height: 22px; }
          .instructions { margin-top: 25px; }
          .btn-container { text-align: center; margin-top: 30px; }
          .btn { background-color: #1A1A1A; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 15px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #edeeef; }
          .footer p { font-size: 12px; color: #c8c6c5; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Action Required</h1>
          </div>
          <div class="content">
            <h2>Dear ${applicantName},</h2>
            <p>Our verification team has reviewed your onboarding request for <strong>${turfName}</strong>. We need some additional information to complete your approval:</p>
            
            <div class="info-box">
              <p>${infoNeeded}</p>
            </div>

            <p class="instructions">Please reply directly to this email with the requested information or documents, or update your status by visiting your application tracking dashboard:</p>
            
            <div class="btn-container">
              <a href="${statusLink}" class="btn">View Onboarding Status</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TurfBook. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
