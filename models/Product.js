const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, default: '' },
  price: { type: Number, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  image: { type: String, default: '' }
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  stock: { type: Number, required: true, default: 0 },
  price: { type: Number, default: 0 },
  variants: [variantSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
