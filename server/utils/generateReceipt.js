import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

/**
 * Generates a booking PDF receipt and streams it directly to the Express response
 * @param {Object} booking - Booking mongoose document (populated with user and turf)
 * @param {Object} res - Express response stream
 */
export const generateBookingReceipt = async (booking, res) => {
  try {
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=TurfBook-Receipt-${booking.bookingId}.pdf`
    );

    // Pipe PDF document to the response stream
    doc.pipe(res);

    // 1. Header Section
    doc
      .rect(0, 0, doc.page.width, 140)
      .fill('#1A1A1A'); // Near black background

    doc
      .fillColor('#AAEE00') // Lime accent
      .font('Helvetica-Bold')
      .fontSize(28)
      .text('TurfBook', 50, 40);

    doc
      .fillColor('#F8F9FA')
      .font('Helvetica')
      .fontSize(12)
      .text('Sports Venue Booking Invoice', 50, 75)
      .text('Precision booking for the elite athlete.', 50, 95);

    doc
      .fillColor('#AAEE00')
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(`ID: ${booking.bookingId}`, doc.page.width - 200, 40, { align: 'right', width: 150 });

    doc
      .fillColor('#FFFFFF')
      .font('Helvetica')
      .fontSize(10)
      .text(`Date: ${new Date(booking.createdAt).toLocaleDateString()}`, doc.page.width - 200, 65, { align: 'right', width: 150 })
      .text(`Status: CONFIRMED`, doc.page.width - 200, 85, { align: 'right', width: 150 });

    // Move layout down below header
    doc.y = 170;

    // 2. Billing details
    doc
      .fillColor('#1A1A1A')
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Billed To:', 50, 170)
      .font('Helvetica')
      .fontSize(11)
      .text(booking.user.name, 50, 190)
      .text(booking.user.email, 50, 205)
      .text(`Phone: ${booking.user.phone || 'N/A'}`, 50, 220);

    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Venue Details:', doc.page.width - 280, 170, { width: 230 })
      .font('Helvetica')
      .fontSize(11)
      .text(booking.turf.name, doc.page.width - 280, 190, { width: 230 })
      .text(`${booking.turf.area}, ${booking.turf.city}`, doc.page.width - 280, 205, { width: 230 })
      .text(booking.turf.address, doc.page.width - 280, 220, { width: 230 });

    // Table Header
    const tableTop = 270;
    doc
      .rect(50, tableTop, doc.page.width - 100, 25)
      .fill('#1A1A1A');

    doc
      .fillColor('#AAEE00')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Description', 60, tableTop + 7)
      .text('Sport', 250, tableTop + 7)
      .text('Duration', 350, tableTop + 7)
      .text('Rate/Hr', 420, tableTop + 7)
      .text('Total Amount', 490, tableTop + 7);

    // Table Content
    const contentTop = tableTop + 25;
    doc
      .fillColor('#1A1A1A')
      .font('Helvetica')
      .fontSize(10)
      .text(`${booking.date} (${booking.startTime} - ${booking.endTime})`, 60, contentTop + 10)
      .text(booking.sport.toUpperCase(), 250, contentTop + 10)
      .text(`${booking.duration} hr`, 350, contentTop + 10)
      .text(`₹${booking.turf.pricePerHour || booking.totalAmount / booking.duration}`, 420, contentTop + 10)
      .font('Helvetica-Bold')
      .text(`₹${booking.totalAmount}`, 490, contentTop + 10);

    doc
      .moveTo(50, contentTop + 30)
      .lineTo(doc.page.width - 50, contentTop + 30)
      .strokeColor('#edeeef')
      .stroke();

    // 3. QR Code & Payments
    const qrTop = contentTop + 50;

    // Generate QR Code containing booking status verification URL/data
    const qrCodeDataUrl = await QRCode.toDataURL(`TurfBook-Verify-Booking-${booking.bookingId}`);
    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
    const qrBuffer = Buffer.from(base64Data, 'base64');

    // Embed QR Code
    doc.image(qrBuffer, 50, qrTop, { width: 100 });

    doc
      .fillColor('#5f5e5e')
      .font('Helvetica')
      .fontSize(8)
      .text('Scan to verify booking', 50, qrTop + 105, { width: 100, align: 'center' });

    // Totals Box
    const totalsTop = qrTop;
    doc
      .fillColor('#1A1A1A')
      .font('Helvetica')
      .fontSize(11)
      .text('Subtotal:', doc.page.width - 250, totalsTop)
      .text(`₹${booking.totalAmount}`, doc.page.width - 120, totalsTop, { align: 'right', width: 70 })
      .text('Tax (GST 0%):', doc.page.width - 250, totalsTop + 20)
      .text('₹0', doc.page.width - 120, totalsTop + 20, { align: 'right', width: 70 })
      .font('Helvetica-Bold')
      .text('Amount Paid:', doc.page.width - 250, totalsTop + 45)
      .fillColor('#486800')
      .text(`₹${booking.totalAmount}`, doc.page.width - 120, totalsTop + 45, { align: 'right', width: 70 });

    doc
      .moveTo(doc.page.width - 250, totalsTop + 38)
      .lineTo(doc.page.width - 50, totalsTop + 38)
      .strokeColor('#edeeef')
      .stroke();

    // 4. Footer Section
    doc
      .fillColor('#c8c6c5')
      .font('Helvetica')
      .fontSize(9)
      .text(
        'Thank you for booking with TurfBook! Please bring a copy of this receipt (digital or physical) and report 10 minutes before your slot time. Standard rules and venue terms apply.',
        50,
        doc.page.height - 80,
        { align: 'center', width: doc.page.width - 100 }
      );

    doc.end();
  } catch (error) {
    console.error('Error generating PDF receipt:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Could not generate PDF receipt.' });
    }
  }
};
