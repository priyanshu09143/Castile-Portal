const express = require('express');
const router = express.Router();

const PASSWORD = '935163';

router.get('/login', (req, res) => {
  if (req.session && req.session.loggedIn) return res.redirect('/');
  res.render('auth/login', { error: null });
});

router.post('/login', (req, res) => {
  const entered = (req.body.password || '').trim();
  if (entered === PASSWORD) {
    req.session.loggedIn = true;
    return res.redirect('/');
  }
  res.render('auth/login', { error: 'Wrong password. Enter 6-digit password.' });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
