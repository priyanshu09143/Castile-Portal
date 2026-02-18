const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const VendorPayment = require('../models/VendorPayment');
const VendorPurchaseBill = require('../models/VendorPurchaseBill');
const { vendorPaymentUpload, vendorPurchaseUpload } = require('../config/multer');

router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ name: 1 });
    res.render('vendors/index', { vendors });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/new', (req, res) => res.render('vendors/form', { vendor: null }));

router.post('/', async (req, res) => {
  try {
    const vendor = new Vendor({ name: (req.body.name || '').trim() });
    if (!vendor.name) return res.status(400).send('Vendor name is required');
    await vendor.save();
    res.redirect('/vendors');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).send('Vendor not found');
    const [purchaseBills, payments] = await Promise.all([
      VendorPurchaseBill.find({ vendor: vendor._id }).sort({ date: -1 }),
      VendorPayment.find({ vendor: vendor._id }).sort({ date: -1 })
    ]);
    res.render('vendors/show', { vendor, purchaseBills, payments });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Promise.all([
      VendorPurchaseBill.deleteMany({ vendor: req.params.id }),
      VendorPayment.deleteMany({ vendor: req.params.id }),
      Vendor.findByIdAndDelete(req.params.id)
    ]);
    res.redirect('/vendors');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Purchase bills (under vendor)
router.get('/:id/purchase-bills/new', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).send('Vendor not found');
    res.render('vendors/purchase-bill-form', { vendor });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/:id/purchase-bills', (req, res) => {
  vendorPurchaseUpload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).send(err.message);
    try {
      const vendor = await Vendor.findById(req.params.id);
      if (!vendor) return res.status(404).send('Vendor not found');
      const amount = parseFloat(req.body.amount) || 0;
      if (amount <= 0) return res.status(400).send('Invalid amount');
      const bill = new VendorPurchaseBill({
        vendor: vendor._id,
        vendorName: vendor.name,
        amount,
        note: (req.body.note || '').trim(),
        image: req.file ? '/uploads/' + req.file.filename : '',
        date: req.body.date ? new Date(req.body.date) : new Date()
      });
      await bill.save();
      res.redirect('/vendors/' + req.params.id);
    } catch (e) {
      res.status(500).send(e.message);
    }
  });
});

router.delete('/:id/purchase-bills/:billId', async (req, res) => {
  try {
    await VendorPurchaseBill.findOneAndDelete({ _id: req.params.billId, vendor: req.params.id });
    res.redirect('/vendors/' + req.params.id);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Payment bills (under vendor) – deducts from bank
router.get('/:id/payments/new', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).send('Vendor not found');
    res.render('vendors/payment-form', { vendor });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/:id/payments', (req, res) => {
  vendorPaymentUpload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).send(err.message);
    try {
      const vendor = await Vendor.findById(req.params.id);
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
      res.redirect('/vendors/' + req.params.id);
    } catch (e) {
      res.status(500).send(e.message);
    }
  });
});

router.delete('/:id/payments/:paymentId', async (req, res) => {
  try {
    await VendorPayment.findOneAndDelete({ _id: req.params.paymentId, vendor: req.params.id });
    res.redirect('/vendors/' + req.params.id);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
