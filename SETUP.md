# Setup Guide — WYT Smart Vending Platform

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** (optional, for version control)

## 1. Initial Setup

### Clone or Extract the Project

```bash
cd c:\Users\Dell\Downloads\wyt
```

### Install Dependencies

```bash
npm install
```

This installs:
- `express` — Web server framework
- `nodemailer` — Email sending
- `multer` — File uploads
- `cors` — Cross-origin requests
- `dotenv` — Environment variable management

## 2. Environment Configuration

### Create `.env` File

```bash
cp .env.example .env
```

### Edit `.env` with Your Settings

```
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password-here
ADMIN_PASSWORD=your-secure-password
PORT=3000
NODE_ENV=development
```

### Gmail App Password Setup

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select **Mail** and **Windows Computer**
5. Copy the generated 16-character password
6. Paste into `.env` as `GMAIL_PASS`

**Note:** Use the app password, NOT your Gmail password.

## 3. Project Structure

```
wyt/
├── server.js              # Main server
├── Database.js            # Handles submissions
├── content.js             # Manages CMS content
├── script.js              # Frontend interactions
├── render.js              # Dynamic content rendering
├── index.html             # Public website
├── admin.html             # Admin panel
├── style.css              # Styles
├── data/
│   ├── content.json       # CMS data (auto-created)
│   └── submissions.json   # Contact submissions (auto-created)
├── uploads/               # User uploads (auto-created)
├── images/                # Logo, etc.
├── nginx/                 # Nginx configs (for Docker)
├── docker-compose.yml     # Docker setup
├── Dockerfile             # Container image
├── package.json           # Dependencies
└── .env                   # Your secrets (don't commit!)
```

## 4. Development Server

### Start the Server

```bash
npm start
```

Output:
```
WYT  →  http://localhost:3000
Admin→  http://localhost:3000/admin
```

### Access the Website

Open **http://localhost:3000** in your browser.

### Access the Admin Panel

1. Go to **http://localhost:3000/admin**
2. Enter your `ADMIN_PASSWORD` from `.env`
3. Click **Login →**

### Test the Contact Form

1. Fill out the contact form on the website
2. Check your Gmail inbox for:
   - **Team notification** (sent to configured email)
   - **Auto-reply** (sent to contact's email)
3. Contact submissions appear in admin panel under **Submissions**

## 5. Database (JSON Files)

The application uses simple JSON files instead of a database:

### `data/content.json`
Stores all CMS content:
- Settings (company name, address, WhatsApp, etc.)
- Stats (deployed machines, locations, uptime)
- Machines (models and specs)
- Locations (partner locations with images)
- Products (vending categories)
- FAQs (Q&A in English and Arabic)
- Partners (company logos)

**This file is auto-created on first run.**

### `data/submissions.json`
Stores contact form submissions:
- Name, email, phone
- Message and timestamp
- IP address
- Submission status

## 6. File Uploads

Uploads go to the `uploads/` folder. Admin can:
- Upload machine and location images
- Upload product images
- Manage all uploads from the admin panel

**Limits:**
- Max file size: 8MB
- Allowed types: Images (handled by Multer)

## 7. Internationalization (i18n)

The website supports **English** and **Arabic** with a single click:

- **Script.js** — Contains all translations
- **Render.js** — Dynamically fetches and renders content from CMS
- **Language Toggle** — Top-right corner switches EN ↔ AR

All CMS fields are bilingual:
- English fields: `name`, `desc`, `q`, `a`
- Arabic fields: `nameAr`, `descAr`, `qAr`, `aAr`

## 8. API Endpoints (Testing)

### Fetch All Content

```bash
curl http://localhost:3000/api/content
```

### Submit Contact Form

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john@example.com",
    "phone":"+20 1234567890",
    "interest":"Machine Hosting",
    "message":"Interested in hosting",
    "lang":"en"
  }'
```

### Admin API (with password)

```bash
# Get submissions
curl http://localhost:3000/api/admin/submissions?pass=your-password

# Get current settings
curl http://localhost:3000/api/content | jq '.settings'
```

## 9. Troubleshooting

### Server won't start
```
Error: EADDRINUSE: address already in use :::3000
```
**Solution:** Port 3000 is already in use. Either:
- Stop the process using port 3000
- Change `PORT` in `.env` to another port

### Emails not sending
```
Error: Invalid login: 535-5.7.8 Username and password not accepted
```
**Solution:**
- Verify your Gmail has 2FA enabled
- Use the **app password**, not your Gmail password
- Check [App Passwords page](https://myaccount.google.com/apppasswords) to regenerate

### Admin panel shows "Wrong password"
- Verify you're using the exact password from `.env`
- Make sure `.env` was saved correctly
- Clear browser cookies and try again

### Uploads not working
- Check `uploads/` folder exists (auto-created)
- Verify file size < 8MB
- Check file permissions

## 10. Development Tips

### Useful Tools

**Visual Studio Code Extensions:**
- REST Client — Test APIs in VS Code
- Thunder Client — API testing
- Live Server — Development server

### Database Management

Edit files directly with caution:
- `data/content.json` — Can be edited manually
- `data/submissions.json` — Treat as read-only (submissions log)

### Logs

Server logs appear in terminal. For file uploads, errors show in console.

## 11. Next Steps

1. **Customize Content** — Use the admin panel to add your:
   - Company settings
   - Machine models
   - Partner locations
   - Products and FAQs

2. **Deploy** — See [DEPLOY.md](DEPLOY.md) for production setup

3. **Backup Data** — Regularly backup:
   - `data/content.json`
   - `data/submissions.json`
   - `uploads/` folder

---

**Need help?** Check the admin panel for all feature tutorials.
