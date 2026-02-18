const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'product-' + unique + ext);
  }
});

const storageVendorPayment = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'vendor-payment-' + unique + ext);
  }
});

const storageVendorPurchase = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'vendor-purchase-' + unique + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/i;
  const ext = path.extname(file.originalname).slice(1) || file.mimetype.split('/')[1];
  if (allowed.test(ext)) return cb(null, true);
  cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const vendorPaymentUpload = multer({
  storage: storageVendorPayment,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const vendorPurchaseUpload = multer({
  storage: storageVendorPurchase,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
module.exports.vendorPaymentUpload = vendorPaymentUpload;
module.exports.vendorPurchaseUpload = vendorPurchaseUpload;
