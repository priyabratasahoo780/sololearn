const PDFDocument = require('pdfkit');

const generateCertificate = (user, title = 'Quiz Certification', certificateId) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 0
    });

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Background Color
    doc.rect(0, 0, pageWidth, pageHeight).fill('#fafafa');

    // Outer Gold Border
    doc.lineWidth(5);
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40).stroke('#C5A059');

    // Inner Decorative Border
    doc.lineWidth(2);
    doc.rect(30, 30, pageWidth - 60, pageHeight - 60).stroke('#333');

    // Corner Ornaments (Simple Lines for now)
    doc.moveTo(30, 60).lineTo(60, 30).stroke();
    doc.moveTo(pageWidth - 30, 60).lineTo(pageWidth - 60, 30).stroke();
    doc.moveTo(30, pageHeight - 60).lineTo(60, pageHeight - 30).stroke();
    doc.moveTo(pageWidth - 30, pageHeight - 60).lineTo(pageWidth - 60, pageHeight - 30).stroke();

    // Header Badge / Icon Placeholder
    // doc.image('path/to/logo.png', pageWidth / 2 - 25, 60, { width: 50 });
    
    // Title
    doc.moveDown(4);
    doc.font('Helvetica-Bold').fontSize(40).fill('#1F2937').text('Certificate of Achievement', 0, 100, { align: 'center' });
    
    // Subtitle
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(16).fill('#4B5563').text('This certificate is proudly presented to', { align: 'center' });

    // Name
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(36).fill('#C5A059').text(user.name || user.email, { align: 'center' });
    doc.lineWidth(1).moveTo(pageWidth / 2 - 150, doc.y).lineTo(pageWidth / 2 + 150, doc.y).stroke('#C5A059');

    // Description
    doc.moveDown(1);
    doc.font('Helvetica').fontSize(18).fill('#374151').text('for successfully completing the course', { align: 'center' });
    
    // Course Title (Subject)
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(28).fill('#111827').text(title || 'Course Title', { align: 'center' });

    doc.moveDown(1);
    doc.font('Helvetica').fontSize(14).fill('#6B7280').text('Your commitment to excellence is appreciated.', { align: 'center' });

    // Details Grid (Date & ID)
    const bottomY = pageHeight - 150;
    
    // Left Side: Date
    doc.fontSize(12).fill('#6B7280').text('Date Issued', 100, bottomY);
    doc.fontSize(14).fill('#1F2937').text(new Date().toLocaleDateString(), 100, bottomY + 20);

    // Right Side: Certificate ID
    const rightX = pageWidth - 200;
    doc.fontSize(12).fill('#6B7280').text('Certificate ID', rightX, bottomY);
    doc.fontSize(14).fill('#1F2937').text(certificateId, rightX, bottomY + 20);

    // Signature (Center Bottom)
    // Symbolic SP Signature
    doc.font('Courier-Bold').fontSize(30).fill('#C5A059').text('S.P.', 0, bottomY, { align: 'center', oblique: true });
    doc.fontSize(10).fill('#6B7280').text('Authorized Signature', 0, bottomY + 35, { align: 'center' });

    doc.end();
  });
};

module.exports = generateCertificate;
