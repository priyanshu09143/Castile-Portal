const mongoose = require('mongoose');

const vendorPaymentSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  vendorName: { type: String, required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, default: '' },
  note: { type: String, default: '' },
  image: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VendorPayment', vendorPaymentSchema);
