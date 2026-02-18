const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Payment = require('../models/Payment');
const VendorPayment = require('../models/VendorPayment');

function getDateRange(filter) {
  const now = new Date();
  let start, end = new Date(now);
  end.setHours(23, 59, 59, 999);
  switch (filter) {
    case 'day':
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start = new Date(now);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      start = new Date(0);
  }
  return { start, end };
}

router.get('/', async (req, res) => {
  try {
    const filter = req.query.filter || 'day';
    const { start, end } = getDateRange(filter);

    const [products, allSales, filteredSales, allPayments, filteredPayments, filteredVendorPayments] = await Promise.all([
      Product.find().populate('category subcategory').sort({ name: 1 }),
      Sale.find().sort({ date: -1 }),
      Sale.find({ date: { $gte: start, $lte: end } }).sort({ date: -1 }),
      Payment.find().sort({ date: -1 }),
      Payment.find({ date: { $gte: start, $lte: end } }).sort({ date: -1 }),
      VendorPayment.find({ date: { $gte: start, $lte: end } }).sort({ date: -1 })
    ]);

    const [paymentsSum, vendorPaymentsSum] = await Promise.all([
      Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      VendorPayment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);
    const totalIncoming = (paymentsSum[0] && paymentsSum[0].total) || 0;
    const totalVendorPaid = (vendorPaymentsSum[0] && vendorPaymentsSum[0].total) || 0;
    const bankBalance = totalIncoming - totalVendorPaid;

    const salesInPeriod = filteredSales.reduce((s, sale) => s + (Number(sale.amount) || 0), 0);
    const paymentsInPeriod = filteredPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const vendorPaymentsInPeriod = filteredVendorPayments.reduce((s, v) => s + (Number(v.amount) || 0), 0);

    res.render('dashboard', {
      products,
      sales: filteredSales,
      allSales,
      payments: filteredPayments,
      vendorPayments: filteredVendorPayments,
      bankBalance,
      filter,
      salesInPeriod,
      paymentsInPeriod,
      vendorPaymentsInPeriod,
      start,
      end,
      cleared: req.query.cleared === '1'
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
