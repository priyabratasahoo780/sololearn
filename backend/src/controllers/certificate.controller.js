const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Certificate = require('../models/Certificate.model');
const User = require('../models/User.model');
const crypto = require('crypto');

// @desc    Generate a certificate (Internal or via specific endpoint after quiz)
// @route   POST /api/certificates/generate
// @access  Private
exports.generateCertificate = asyncHandler(async (req, res, next) => {
  const { title, category, scorePercent } = req.body;

  if (scorePercent < 80) {
    return next(new ApiError(400, 'Score too low for certificate. Need 80%+'));
  }

  // Check if already exists for this category/title + user
  // (Optional: allow multiples? For now, unique per category/title)
  const existing = await Certificate.findOne({
    user: req.user.id,
    title: title, 
    category: category
  });

  if (existing) {
    return res.status(200).json({
      success: true,
      message: 'Certificate already exists',
      data: existing
    });
  }

  const certificateCode = crypto.randomBytes(8).toString('hex').toUpperCase();

  const certificate = await Certificate.create({
    user: req.user.id,
    title,
    category,
    scorePercent,
    certificateCode
  });

  res.status(201).json({
    success: true,
    data: certificate
  });
});

// @desc    Get my certificates
// @route   GET /api/certificates
// @access  Private
exports.getMyCertificates = asyncHandler(async (req, res, next) => {
  const certificates = await Certificate.find({ user: req.user.id }).sort('-issueDate');

  res.status(200).json({
    success: true,
    count: certificates.length,
    data: certificates
  });
});

// @desc    Get certificate by ID (Public verification?)
// @route   GET /api/certificates/:id
// @access  Public
exports.getCertificateById = asyncHandler(async (req, res, next) => {
  const certificate = await Certificate.findById(req.params.id).populate('user', 'name');

  if (!certificate) {
    return next(new ApiError(404, 'Certificate not found'));
  }

  res.status(200).json({
    success: true,
    data: certificate
  });
});

// @desc    Download certificate PDF
// @route   GET /api/certificates/:id/download
// @access  Private
exports.downloadCertificate = asyncHandler(async (req, res, next) => {
  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    return next(new ApiError(404, 'Certificate not found'));
  }

  // Ensure user owns certificate (or is admin - optional)
  if (certificate.user.toString() !== req.user.id) {
    return next(new ApiError(403, 'Not authorized to download this certificate'));
  }

  const generateCertificate = require('../utils/generateCertificate');
  const pdfBuffer = await generateCertificate(req.user, certificate.title, certificate.certificateCode);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="Certificate-${certificate.title}.pdf"`,
    'Content-Length': pdfBuffer.length
  });

  res.send(pdfBuffer);
});
