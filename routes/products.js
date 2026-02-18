const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const upload = require('../config/multer').single('image');

function parseVariants(body) {
  const names = [].concat(body.variant_name || []).filter(Boolean);
  const skus = [].concat(body.variant_sku || []);
  const prices = [].concat(body.variant_price || []);
  const stocks = [].concat(body.variant_stock || []);
  return names.map((name, i) => ({
    name: String(name).trim(),
    sku: (skus[i] != null ? String(skus[i]).trim() : '') || '',
    price: parseFloat(prices[i]) || 0,
    stock: parseInt(stocks[i], 10) || 0,
    image: ''
  }));
}

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('category subcategory').sort({ updatedAt: -1 });
    res.render('products/index', { products });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/new', async (req, res) => {
  try {
    const [categories, subcategories] = await Promise.all([
      Category.find().sort({ name: 1 }),
      Subcategory.find().populate('category').sort({ name: 1 })
    ]);
    res.render('products/form', { product: null, categories, subcategories });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/', (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).send(err.message);
    try {
      const variants = parseVariants(req.body);
      const hasVariants = variants.length > 0;
      const product = new Product({
        name: req.body.name,
        image: req.file ? '/uploads/' + req.file.filename : '',
        category: req.body.categoryId || undefined,
        subcategory: req.body.subcategoryId || undefined,
        stock: hasVariants ? 0 : (parseInt(req.body.stock, 10) || 0),
        price: parseFloat(req.body.price) || 0,
        variants: hasVariants ? variants : []
      });
      await product.save();
      res.redirect('/products');
    } catch (e) {
      res.status(500).send(e.message);
    }
  });
});

router.get('/:id/edit', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category subcategory');
    if (!product) return res.status(404).send('Product not found');
    const [categories, subcategories] = await Promise.all([
      Category.find().sort({ name: 1 }),
      Subcategory.find().populate('category').sort({ name: 1 })
    ]);
    res.render('products/form', { product, categories, subcategories });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put('/:id', (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).send(err.message);
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).send('Product not found');
      const variants = parseVariants(req.body);
      const hasVariants = variants.length > 0;
      product.name = req.body.name;
      product.category = req.body.categoryId || undefined;
      product.subcategory = req.body.subcategoryId || undefined;
      product.stock = hasVariants ? 0 : (parseInt(req.body.stock, 10) || 0);
      product.price = parseFloat(req.body.price) || 0;
      product.variants = hasVariants ? variants : [];
      if (req.file) product.image = '/uploads/' + req.file.filename;
      await product.save();
      res.redirect('/products');
    } catch (e) {
      res.status(500).send(e.message);
    }
  });
});

router.post('/:id/restock', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('Product not found');
    const add = parseInt(req.body.quantity, 10) || 0;
    if (add <= 0) return res.redirect('/products');
    const variantIndex = req.body.variantIndex != null ? parseInt(req.body.variantIndex, 10) : -1;
    if (product.variants && product.variants.length > 0 && variantIndex >= 0 && variantIndex < product.variants.length) {
      product.variants[variantIndex].stock += add;
    } else if (!product.variants || product.variants.length === 0) {
      product.stock += add;
    }
    await product.save();
    res.redirect('/products');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/products');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
