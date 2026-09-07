# WYT — Complete Setup Guide

═══════════════════════════════════════════════════════
  STEP 1 — CREATE YOUR FREE MONGODB DATABASE (5 min)
═══════════════════════════════════════════════════════

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with your Google account or email
3. Choose "FREE" plan (M0 Sandbox)
4. Select a region → choose "Europe (Frankfurt)" (closest to Egypt)
5. Click "Create"

─── CONNECT YOUR DATABASE ───

6. Click "Connect" on your cluster
7. Click "Drivers"
8. Copy the connection string — it looks like:
   mongodb+srv://yourname:yourpassword@cluster0.xxxxx.mongodb.net/

9. Replace <password> in the string with your actual MongoDB password

─── WHITELIST YOUR IP ───

10. Go to "Network Access" in the left menu
11. Click "Add IP Address"
12. Click "Allow Access from Anywhere" → Confirm
    (This lets your server connect from any IP)

─── VIEW YOUR DATA LIVE ───

Any time you want to see your database:
→ Go to https://cloud.mongodb.com
→ Click your cluster → "Browse Collections"
→ You'll see: submissions, locations, machines,
  products, faqs, partners, settings, stats
→ You can read, edit, or delete any record directly here


═══════════════════════════════════════════════════════
  STEP 2 — SET UP YOUR .ENV FILE
═══════════════════════════════════════════════════════

1. In your wyt folder, find ".env.example"
2. Make a copy and rename it to ".env"
3. Open .env in VS Code and fill in:

  MONGODB_URI=mongodb+srv://yourname:yourpassword@cluster0.xxxxx.mongodb.net/
  GMAIL_USER=mohamedtamer668er@gmail.com
  GMAIL_PASS=your_16_char_gmail_app_password
  ADMIN_PASSWORD=wyt2025admin
  PORT=3000

─── GET GMAIL APP PASSWORD ───

1. Go to: https://myaccount.google.com/apppasswords
2. Make sure 2-Step Verification is ON first
3. App name → type "WYT Website" → Generate
4. Copy the 16-character code into GMAIL_PASS
   (remove spaces between the letters)


═══════════════════════════════════════════════════════
  STEP 3 — INSTALL AND RUN
═══════════════════════════════════════════════════════

Open PowerShell in your wyt folder:

  cd C:\Users\Dell\Downloads\wyt
  npm install
  node server.js

You should see:
  ✅  MongoDB connected → cluster0.xxxxx.mongodb.net
  ✅  Email ready
  ✅  Database seeded with default content
  🚀  WYT running   → http://localhost:3000
  🔐  Admin panel   → http://localhost:3000/admin


═══════════════════════════════════════════════════════
  STEP 4 — USING THE ADMIN PANEL
═══════════════════════════════════════════════════════

Open: http://localhost:3000/admin?pass=wyt2025admin

From the admin panel you can:

  📍 Locations   → Add a location with photo → appears on website INSTANTLY
  🤖 Machines    → Add machine models with specs and photos
  🛒 Products    → Add product categories with photos
  ❓ FAQs        → Add / delete questions and answers
  🤝 Partners    → Add company logos to the "Trusted by" bar
  📈 Stats       → Change the counter numbers (500+, 120+, 98%)
  ⚙️  Settings   → Update phone, email, WhatsApp number, address
  🖼️  Images     → Upload photos for use anywhere
  📋 Submissions → See all contact form submissions, export to CSV

REAL-TIME: When you add or delete anything in the admin,
the website updates INSTANTLY — no page refresh needed.


═══════════════════════════════════════════════════════
  STEP 5 — VIEW YOUR DATABASE ANYTIME
═══════════════════════════════════════════════════════

Method 1 — MongoDB Atlas website (recommended):
  → https://cloud.mongodb.com
  → Browse Collections → select "wyt" database
  → See every submission, location, machine, etc.
  → You can filter, search, edit or delete records directly

Method 2 — MongoDB Compass (free desktop app):
  → Download from: https://www.mongodb.com/products/compass
  → Paste your MONGODB_URI connection string
  → Browse all collections in a clean GUI

Method 3 — Admin Panel on your website:
  → http://localhost:3000/admin?pass=wyt2025admin
  → Submissions tab shows all contact form entries
  → Export as CSV with one click


═══════════════════════════════════════════════════════
  YOUR DATABASE COLLECTIONS
═══════════════════════════════════════════════════════

  submissions  ← Every contact form submission
               (name, email, phone, interest, message, date, IP)

  locations    ← Your machine locations shown on the website
  machines     ← Machine models (Pro 500, Brew, Fresh, Compact)
  products     ← Product categories (Snacks, Drinks, Healthy, Coffee)
  faqs         ← FAQ questions and answers
  partners     ← "Trusted by" company logos
  settings     ← WhatsApp number, email, phone, address, hours
  stats        ← The 500+, 120+, 98% counter numbers


═══════════════════════════════════════════════════════
  DEPLOYMENT (making it live on the internet)
═══════════════════════════════════════════════════════

Once you buy a domain and a server, follow DEPLOY.md
Total cost: ~$7/month (server + domain, SSL is free)

Server options:
  - DigitalOcean: https://digitalocean.com ($6/month)
  - Railway:      https://railway.app (free tier available)
  - Render:       https://render.com (free tier available)