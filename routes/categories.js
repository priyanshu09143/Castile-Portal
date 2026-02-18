const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    const subcategories = await Subcategory.find().populate('category').sort({ name: 1 });
    res.render('categories/index', { categories, subcategories });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    if (!name) return res.status(400).send('Category name is required');
    await Category.create({ name });
    res.redirect('/categories');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/:id/subcategories', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send('Category not found');
    const name = (req.body.name || '').trim();
    if (!name) return res.status(400).send('Subcategory name is required');
    await Subcategory.create({ name, category: category._id });
    res.redirect('/categories');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/subcategory/:id', async (req, res) => {
  try {
    await Subcategory.findByIdAndDelete(req.params.id);
    res.redirect('/categories');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Subcategory.deleteMany({ category: req.params.id });
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/categories');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
