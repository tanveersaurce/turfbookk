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
