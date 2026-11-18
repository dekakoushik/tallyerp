# ERP Nexus - Complete Multi-Company & Farm Billing System

Enterprise-grade, professional billing, invoicing, estimate, payment reconciliation, and agribusiness crop management system.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM with SQLite** (ready to switch to PostgreSQL if desired).

---

## 🚀 Key Features

### 1. Multi-Entity Architecture (Companies, Farms & Branches)
- Create unlimited **Companies**, **Farms**, **Agro Enterprises**, and **Regional Branches**.
- Instant entity switching from the top navigation bar.
- Individual legal entity names, Tax IDs (GSTIN / VAT / EIN), and distinct currencies (`USD $`, `INR ₹`, `EUR €`, `GBP £`, etc.).
- Dedicated bank remittance accounts (Bank name, Account #, SWIFT/IFSC, UPI / Instant QR).
- Custom document sequencing per entity (e.g. `AG-INV-` for company vs `GVF-INV-` for farm).

### 2. Complete Billing Lifecycle
- **Invoices**: Tax invoices, Proforma bills, and Agricultural produce bills with automated sequential numbering.
- **Estimates / Quotes**: Pricing proposals with 1-click **"Convert to Invoice"** functionality.
- **Dynamic Line Items**: Real-time line item tax calculation, item discounts, unit selection (`quintal`, `kg`, `metric_ton`, `box`, `bag`, `liter`, `acre`, `unit`, `hour`), and catalog auto-fill.
- **Inventory Integration**: Automatic stock decrement upon invoicing with low-stock warnings.
- **Print & PDF Ready**: Pixel-perfect A4 invoice layout with clean header, tax IDs, item table, bank details, terms, and signature box using `@media print`.

### 3. Agribusiness & Farm Batch Module
- **Farm Batches & Crop Lifecycle**: Track field plots, sowing dates, expected harvest dates, and acreage.
- **Yield Forecast vs Actual**: Monitor estimated yield against actual harvested weight in quintals/tons.
- **Profitability Analysis**: Compare crop input costs (seeds, fertilizer, fuel) against produce sale revenues.

### 4. Payments, Ledgers & Receivables
- Record partial or full invoice payments with transaction reference numbers.
- Auto-updating invoice status (`PAID`, `PARTIAL`, `OVERDUE`).
- Customer outstanding balances and credit limit monitoring.
- Direct customer ledger receipts.

### 5. Operating Expenses
- Categorize farm input costs (fertilizer, diesel, drip irrigation maintenance) and business operating expenses.

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed
```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📦 Production Deployment
```bash
npm run build
npm start
```
To connect PostgreSQL instead of SQLite, update the provider in `prisma/schema.prisma` from `sqlite` to `postgresql` and provide your `DATABASE_URL` in `.env`.
