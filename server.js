require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const connectDB = require('./config/db');
const { requireAuth } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const saleRoutes = require('./routes/sales');
const paymentRoutes = require('./routes/payments');
const vendorRoutes = require('./routes/vendors');
const dashboardRoutes = require('./routes/dashboard');
const resetRoutes = require('./routes/reset');

connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Behind a proxy in production (e.g. Render), trust X-Forwarded-* headers
// so secure cookies work correctly over HTTPS.
app.set('trust proxy', 1);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'sales-portal-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    // In production, mark cookies secure when the request is over HTTPS
    secure: process.env.NODE_ENV === 'production' ? 'auto' : false,
    maxAge: 7 * 24 * 60 * 60 * 1000  // 1 week
  }
}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/manifest.webmanifest', (req, res) => {
  res.type('application/manifest+json');
  res.sendFile(path.join(__dirname, 'public', 'manifest.webmanifest'));
});

app.use(authRoutes);

app.use(requireAuth);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/sales', saleRoutes);
app.use('/payments', paymentRoutes);
app.use('/vendors', vendorRoutes);
app.use('/reset', resetRoutes);
app.use('/', dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message || 'Something went wrong.');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
