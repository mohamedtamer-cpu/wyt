# Running WYT

1. Install dependencies with `npm install`.
2. Configure `MONGODB_URI`, `ADMIN_PASSWORD`, and optionally `PORT` in `.env` (or in your hosting environment).
3. Run `npm start`, then open `http://localhost:3000/admin` (use your configured port if different).
4. Log in with the value of `ADMIN_PASSWORD`. Passwords are no longer read from URL parameters or embedded in browser code.

The dashboard supports adding/deleting machines, locations, products, FAQs and partners; updating contact settings and counters; and viewing contact submissions. Images must be PNG, JPEG, WebP or GIF and no larger than 2 MB. Content updates are picked up by the public website within approximately five seconds.

An empty MongoDB database is initialized from `data/content.json` on first content access. Existing content is preserved. Contact messages are stored in MongoDB and can be viewed in Submissions; automatic email delivery is not implemented.

Run `npm test` to check API routing, authentication, input validation, contact handling and content CRUD using an isolated in-memory test store. These tests do not write to your MongoDB database.

For Vercel, set the environment variables in the project settings and redeploy. For Docker/Nginx, keep the proxy request-size limit at least 4 MB to accommodate image payloads.

This file supersedes the older admin/password and instant-update instructions in SETUP.md and DEPLOY.md.
