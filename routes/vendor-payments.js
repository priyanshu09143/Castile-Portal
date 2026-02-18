const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const VendorPayment = require('../models/VendorPayment');
const { vendorPaymentUpload } = require('../config/multer');

router.get('/', async (req, res) => {
  try {
    const vendorPayments = await VendorPayment.find().populate('vendor').sort({ date: -1 });
    res.render('vendor-payments/index', { vendorPayments });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/new', async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ name: 1 });
    res.render('vendor-payments/form', { vendors });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/', (req, res) => {
  vendorPaymentUpload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).send(err.message);
    try {
      const vendor = await Vendor.findById(req.body.vendorId);
      if (!vendor) return res.status(404).send('Vendor not found');
      const amount = parseFloat(req.body.amount) || 0;
      if (amount <= 0) return res.status(400).send('Invalid amount');
      const vp = new VendorPayment({
        vendor: vendor._id,
        vendorName: vendor.name,
        amount,
        transactionId: (req.body.transactionId || '').trim(),
        note: (req.body.note || '').trim(),
        image: req.file ? '/uploads/' + req.file.filename : '',
        date: req.body.date ? new Date(req.body.date) : new Date()
      });
      await vp.save();
      res.redirect('/vendor-payments');
    } catch (e) {
      res.status(500).send(e.message);
    }
  });
});

router.delete('/:id', async (req, res) => {
  try {
    await VendorPayment.findByIdAndDelete(req.params.id);
    res.redirect('/vendor-payments');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
