const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ date: -1 });
    res.render('payments/index', { payments });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/new', (req, res) => res.render('payments/form'));

router.post('/', async (req, res) => {
  try {
    const payment = new Payment({
      amount: parseFloat(req.body.amount) || 0,
      source: (req.body.source || '').trim() || 'ecommerce',
      note: req.body.note || '',
      date: req.body.date ? new Date(req.body.date) : new Date()
    });
    await payment.save();
    res.redirect('/payments');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
