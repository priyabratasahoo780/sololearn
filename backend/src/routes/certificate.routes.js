const express = require('express');
const {
  generateCertificate,
  getMyCertificates,
  getCertificateById,
  downloadCertificate
} = require('../controllers/certificate.controller');

const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .get(protect, getMyCertificates);

router.route('/generate')
  .post(protect, generateCertificate);

router.route('/:id/download')
  .get(protect, downloadCertificate);

router.route('/:id')
  .get(getCertificateById);

module.exports = router;
