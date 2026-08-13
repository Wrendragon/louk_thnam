# Medicine Store — Backend (Express + MySQL)

REST API for the storefront and admin panel, built directly on top of `Schema.sql`.

## Setup

1. **Create the database** (uses your existing `Schema.sql`):
   ```bash
   mysql -u root -p < sql/schema.sql
   ```

2. **Run migrations** (adds columns introduced after the original schema):
   ```bash
   mysql -u root -p < sql/migration_001_add_avatar.sql
   mysql -u root -p < sql/migration_002_add_brand.sql
   mysql -u root -p < sql/migration_003_add_order_contact_fields.sql
   ```

3. **Load demo data** (admin/customer accounts, categories, products):
   ```bash
   mysql -u root -p < sql/seed.sql
   ```
   Demo accounts (password for both is `password123`):
   - Admin: `admin@meridian.co`
   - Customer: `customer@meridian.co`

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `DB_USER`, `DB_PASSWORD`, and a real `JWT_SECRET`.

5. **Install dependencies and run**:
   ```bash
   npm install
   npm run dev      # nodemon, auto-restarts on change
   # or: npm start
   ```
   The API runs on `http://localhost:5000` by default.

## Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create a customer account |
| POST | `/api/auth/login` | — | Log in, returns a JWT |
| GET  | `/api/auth/me` | Bearer token | Current user profile |
| PUT  | `/api/auth/me` | Bearer token | Update own name/phone/avatar, optionally change password |
| POST | `/api/auth/forgot-password` | — | Requests a reset token (see note below) |
| POST | `/api/auth/reset-password` | — | Resets password with a valid token |
| GET  | `/api/categories` | — | List categories |
| GET  | `/api/products` | — | List products (optional `?category_id=`) |
| GET  | `/api/products/:id` | — | Single product detail |
| POST | `/api/products` | Admin | Create product |
| PUT  | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET  | `/api/admin/stats` | Admin | Dashboard counters |
| GET  | `/api/admin/orders` | Admin | Recent orders |
| GET  | `/api/admin/low-stock` | Admin | Products with stock < 10 |
| POST | `/api/orders` | Bearer token | Place an order from cart items + delivery/contact info |
| GET  | `/api/orders/mine` | Bearer token | The logged-in user's own order history |

## About the password-reset email

There's no email provider wired up. `forgot-password` writes a row to `password_resets`
(as defined in `Schema.sql`) and logs the token to the server console. In development
(`NODE_ENV != production`) the token is also returned in the API response so you can test
the full flow without a mail server. Before deploying, plug in a real provider (SendGrid,
Amazon SES, Nodemailer + SMTP, etc.) in `src/routes/auth.routes.js` and stop returning the
token in the response.
