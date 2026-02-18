# Castile Portal

A **Node.js** stock, sales, and payment portal with **MongoDB**, **EJS** frontend, and **Multer** for image uploads. Manage products (with categories, subcategories, and variants), record sales, track ecommerce payments, manage vendors and their bills, and view your bank balance with day/week/month filters. Includes login, responsive layout with mobile side nav, and PWA install support.

---

## Features

### Authentication
- **Login** with 6-digit password (default: `935163`).
- **Auto-login**: Typing the 6th digit submits the form automatically.
- **Session** lasts 1 week; no re-login during that period.
- **Logout** from the nav.

### Dashboard
- **Current bank balance**: Total payments received minus total vendor payments.
- **Filters**: **Today**, **This Week**, **This Month** for sales and payments.
- Summary cards: bank balance, sales in period, payments in period, vendor payments in period.
- Tables: sales in period, payments in period, vendor payments in period, products & stock.

### Products
- **Add/Edit** products with name, main image (Multer), category, subcategory, base price, and optional **variants**.
- **Variants**: Each variant has name, SKU, price, and stock. Products without variants use a single stock and price.
- **Restock**: Per-product (no variants) or per-variant (products with variants).
- **Delete** products.

### Categories & Subcategories
- **Categories**: Add and delete categories.
- **Subcategories**: Under each category, add and remove subcategories.
- Products can be assigned a category and an optional subcategory (subcategory list filtered by category).

### Sales
- **Record sale**: Choose product; if the product has variants, choose variant. Enter quantity. Stock is reduced automatically (product or selected variant).
- Sales list shows product, variant (if any), quantity, amount, date.

### Payments (ecommerce)
- **Add payment**: Amount, source (e.g. ecommerce), optional note, date. Increases **bank balance**.
- All payments are summed for the current bank balance.

### Vendors
- **Vendors**: Add and remove vendors.
- **Per vendor**:
  - **Purchase bills**: Add purchase bill (amount, note, optional bill image, date). Record only; does not change bank balance.
  - **Payment bills**: Add payment to vendor (amount, optional transaction ID, note, optional receipt image, date). **Deducts from bank balance**.
- View and delete purchase bills and payment bills per vendor.

### Clear all data
- **Clear all data** (nav): Requires your **6-digit login password** to confirm. Permanently deletes all products, categories, subcategories, sales, payments, vendors, purchase bills, and payment bills.

### Mobile & PWA
- **Responsive** layout for mobile; tables scroll horizontally where needed.
- **Mobile nav**: 3-line hamburger opens a **side menu** with all links.
- **Install as app**: Add to Home Screen (iOS) or Install app (Android Chrome). App name: **Castile Portal**. Session and experience work in standalone mode.

---

## Tech Stack

| Layer      | Technology |
|-----------|------------|
| Runtime   | Node.js    |
| Framework | Express    |
| Database  | MongoDB (Mongoose) |
| View      | EJS        |
| Upload    | Multer     |
| Session   | express-session |
| Other     | body-parser, method-override, dotenv |
| Dev       | nodemon (auto-restart) |

---

## Project Structure

```
sales/
├── server.js              # App entry, middleware, routes
├── package.json
├── .env                   # PORT, MONGODB_URI, SESSION_SECRET (optional)
├── config/
│   ├── db.js              # MongoDB connection
│   └── multer.js          # Product & vendor payment image uploads
├── middleware/
│   └── auth.js            # requireAuth (redirect to /login)
├── models/
│   ├── Category.js
│   ├── Subcategory.js
│   ├── Product.js         # category, subcategory, variants[]
│   ├── Sale.js            # product, variantName, quantity, amount
│   ├── Payment.js
│   ├── Vendor.js
│   ├── VendorPayment.js
│   └── VendorPurchaseBill.js
├── routes/
│   ├── auth.js            # GET/POST /login, GET /logout
│   ├── dashboard.js       # GET /
│   ├── products.js        # CRUD, restock (with variantIndex)
│   ├── categories.js      # CRUD categories, subcategories
│   ├── sales.js           # List, record sale (with variant)
│   ├── payments.js
│   ├── vendors.js         # CRUD vendors, purchase bills, payment bills
│   └── reset.js           # GET/POST /reset (password-protected clear)
├── views/
│   ├── partials/          # head, nav, footer
│   ├── auth/              # login
│   ├── dashboard.ejs
│   ├── products/          # index, form (category, subcategory, variants)
│   ├── categories/        # index (categories & subcategories)
│   ├── sales/             # index, form (product + variant)
│   ├── payments/          # index, form
│   ├── vendors/           # index, form, show, purchase-bill-form, payment-form
│   └── reset/             # confirm (password input + clear button)
└── public/
    ├── css/style.css      # Layout, components, responsive, nav/side nav
    ├── js/app.js          # Form confirm, nav toggle (mobile)
    ├── uploads/           # Product & vendor images (Multer)
    ├── manifest.webmanifest
    ├── sw.js              # Minimal service worker (PWA)
    └── icons/icon.svg      # PWA icon
```

---

## Setup

### Prerequisites
- **Node.js** (v14 or later)
- **MongoDB** (local or remote URI)

### Install and run

1. **Clone or copy** the project and go to the folder:
   ```bash
   cd sales
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment** (optional): Create a `.env` file in the project root:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/sales-portal
   SESSION_SECRET=your-secret-for-sessions
   ```
   - If you omit `.env`, the app uses `PORT=3000`, `MONGODB_URI=mongodb://127.0.0.1:27017/sales-portal`, and a default session secret.

4. **Start MongoDB** (if local), then start the app:
   ```bash
   npm start
   ```
   For development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000). You will be redirected to **Login**. Enter the 6-digit password (default `935163`).

---

## Environment Variables

| Variable        | Description                    | Default |
|----------------|--------------------------------|--------|
| `PORT`         | Server port                    | `3000` |
| `MONGODB_URI`  | MongoDB connection string      | `mongodb://127.0.0.1:27017/sales-portal` |
| `SESSION_SECRET` | Secret for session cookies   | `sales-portal-secret` |

---

## Usage Overview

| Page / Action      | URL / Location        | What you can do |
|--------------------|------------------------|-----------------|
| Login              | `/login`               | Enter 6-digit password; auto-submit on 6th digit. |
| Dashboard          | `/`                    | View bank balance, filters (day/week/month), sales, payments, vendor payments, products. |
| Products           | `/products`            | List products (category, subcategory, variants or single stock). Add, edit, restock, delete. |
| Add/Edit Product   | `/products/new`, `/products/:id/edit` | Set name, category, subcategory, image, price; add optional variants (name, SKU, price, stock). |
| Categories         | `/categories`          | Add/delete categories; under each, add/delete subcategories. |
| Sales              | `/sales`               | List sales. “Record Sale”: choose product (and variant if any), quantity; stock is reduced. |
| Payments           | `/payments`            | List and add ecommerce payments (increase bank balance). |
| Vendors            | `/vendors`             | List vendors; click one to open vendor page. |
| Vendor page        | `/vendors/:id`         | Add purchase bill or payment bill; view/delete bills. |
| Clear all data     | `/reset`               | Enter login password and confirm to delete all data. |
| Logout             | `/logout`              | End session. |

---

## Bank Balance Logic

- **Bank balance** = (Sum of all **Payments** from ecommerce) − (Sum of all **Vendor payment bills**).
- Adding a payment increases the balance; adding a vendor payment bill decreases it.

---

## Install as App (PWA)

- **Android (Chrome):** Open the site → menu (⋮) → **Install app** or **Add to Home screen**. Name: **Castile Portal**.
- **iOS (Safari):** Share → **Add to Home Screen**. Name: **Castile Portal**.
- For the install prompt and best behavior, use **HTTPS** in production.

---

## License

Use and modify as needed for your project.
