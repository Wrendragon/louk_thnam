# Meridian Apothecary — Medicine Store

A full React + Node/Express + MySQL app built on the provided `Schema.sql`.

```
medicine-store/
├── backend/     Express API, connects to MySQL, JWT auth
└── frontend/    React (Vite) app — storefront, cart/checkout, admin panel
```

## Pages

| Route | Who can see it | What it is |
|---|---|---|
| `/` | Everyone | Home — hero, category shortcuts, featured products |
| `/shop` | Everyone | Full catalog, filterable by category |
| `/product/:id` | Everyone | Product detail — price, description, dosage, add to cart |
| `/about` | Everyone | About the pharmacy |
| `/contact` | Everyone | Contact info + inquiry form |
| `/cart` | Everyone | Cart — change quantity, cancel an item, see the total |
| `/login`, `/register`, `/forgot-password` | Everyone | Auth |
| `/checkout` | Logged-in users | Enter delivery address + contact info, place the order |
| `/profile` | Logged-in users | Edit name/phone/avatar, change password |
| `/admin`, `/admin/products` | Admin only | Dashboard + product management |

## How it's laid out

- **Storefront is public.** Browsing, filtering, product detail, and adding to cart never
  require an account. The cart itself lives in `localStorage` on the visitor's browser.
- **Checkout requires login**, because an order is tied to a `user_id` in the `orders` table.
  If you go to `/checkout` while logged out, you're sent to `/login` first — your cart stays
  intact.
- **Admin panel is protected**, checking the logged-in user's role is `Admin`.
- **Real MySQL connection**, not mock data — every page reads/writes through the Express API,
  including placing an order (which decrements `products.stock_quantity` in a transaction).

## Quick start

**1. Database + API** — see `backend/README.md` for full details:
```bash
cd backend
mysql -u root -p < sql/schema.sql
mysql -u root -p < sql/migration_001_add_avatar.sql
mysql -u root -p < sql/migration_002_add_brand.sql
mysql -u root -p < sql/migration_003_add_order_contact_fields.sql
mysql -u root -p < sql/seed.sql
cp .env.example .env    # then edit DB credentials + JWT_SECRET
npm install
npm run dev
```
(Setting up fresh? You can run `medicine_store_full_schema.sql` instead of `schema.sql` +
the three migrations — it's the same result in one file.)

**2. Frontend:**
```bash
cd frontend
cp .env.example .env    # defaults to http://localhost:5000/api, adjust if needed
npm install
npm run dev
```

Open `http://localhost:5173`. The home page loads first, no login required. Use the demo
accounts below (or register a new customer) to try checkout:

- **Admin:** `admin@meridian.co` / `password123` → redirected to `/admin` after login
- **Customer:** `customer@meridian.co` / `password123`

## How checkout works

1. Add items to the cart from the shop or a product page — quantity is capped at what's in stock.
2. On `/cart`, adjust quantity (+/-) or cancel (remove) any item; the total updates live.
3. "Proceed to checkout" — if not logged in, you're sent to log in first.
4. On `/checkout`, enter a contact name, phone, and delivery address, and confirm the order
   total, then place the order.
5. The server re-checks stock and re-computes the total from the database (never trusts
   prices sent by the browser), creates the `orders` + `order_items` rows in a transaction,
   and decrements stock. The cart is cleared and a confirmation with the order number is shown.
6. Admins see every order — with the delivery address and contact info — on the dashboard.

## Notes on what's simplified

- **Password reset email**: there's no email provider connected. The reset token is logged
  server-side and, in development only, returned in the API response so you can test the
  flow end to end. Swap in a real mailer before going live (see `backend/README.md`).
- **Contact form**: `/contact` shows a confirmation locally but isn't wired to a backend —
  add a `POST /api/contact` route + a table if you want messages actually stored or emailed.
- **Payment**: orders are created with status `Pending` — there's no payment processor
  wired in. An admin can update `order_status` directly in the database (or you can add a
  PATCH endpoint) once you're ready to track paid/shipped orders from the UI.
- **Images**: stored as a URL in `products.image_url` / `users.avatar_url` rather than file
  uploads. Swap in real file uploads (e.g. multer + S3) when you're ready.
