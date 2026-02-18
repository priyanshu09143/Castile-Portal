const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Payment = require('../models/Payment');
const Vendor = require('../models/Vendor');
const VendorPayment = require('../models/VendorPayment');
const VendorPurchaseBill = require('../models/VendorPurchaseBill');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

const PASSWORD = '935163';

router.get('/', (req, res) => res.render('reset/confirm', { error: null }));

router.post('/', async (req, res) => {
  const entered = (req.body.password || '').trim();
  if (entered !== PASSWORD) {
    return res.render('reset/confirm', { error: 'Wrong password. Enter your 6-digit login password to clear data.' });
  }
  try {
    await Promise.all([
      Product.deleteMany({}),
      Sale.deleteMany({}),
      Payment.deleteMany({}),
      Vendor.deleteMany({}),
      VendorPayment.deleteMany({}),
      VendorPurchaseBill.deleteMany({}),
      Subcategory.deleteMany({}),
      Category.deleteMany({})
    ]);
    res.redirect('/?cleared=1');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
