const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Sale = require('../models/Sale');

router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find().populate('product').sort({ date: -1 });
    res.render('sales/index', { sales });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/new', async (req, res) => {
  try {
    const products = await Product.find().populate('category subcategory').sort({ name: 1 });
    res.render('sales/form', { products });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const product = await Product.findById(req.body.productId);
    if (!product) return res.status(404).send('Product not found');
    const quantity = parseInt(req.body.quantity, 10) || 0;
    if (quantity <= 0) return res.status(400).send('Invalid quantity');

    const hasVariants = product.variants && product.variants.length > 0;
    let amount = 0;
    let variantName = '';

    if (hasVariants) {
      const variantIndex = parseInt(req.body.variantIndex, 10);
      if (variantIndex < 0 || variantIndex >= product.variants.length) return res.status(400).send('Select a variant');
      const v = product.variants[variantIndex];
      if (v.stock < quantity) return res.status(400).send('Insufficient stock for this variant');
      amount = (v.price || product.price || 0) * quantity;
      variantName = v.name;
      product.variants[variantIndex].stock -= quantity;
    } else {
      if (product.stock < quantity) return res.status(400).send('Insufficient stock');
      amount = (product.price || 0) * quantity;
      product.stock -= quantity;
    }

    await product.save();
    await Sale.create({
      product: product._id,
      productName: product.name,
      variantName,
      quantity,
      amount,
      date: req.body.date ? new Date(req.body.date) : new Date()
    });
    res.redirect('/sales');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
