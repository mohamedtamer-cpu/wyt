# Running WYT

1. Install dependencies with `npm install`.
2. Configure `MONGODB_URI`, `ADMIN_PASSWORD`, and optionally `PORT` in `.env` (or in your hosting environment).
3. Run `npm start`, then open `http://localhost:3000/admin` (use your configured port if different).
4. Log in with the value of `ADMIN_PASSWORD`. Passwords are no longer read from URL parameters or embedded in browser code.

The dashboard supports adding/deleting machines, locations, products, FAQs and partners; updating contact settings and counters; and viewing contact submissions. Images must be PNG, JPEG, WebP or GIF and no larger than 2 MB. Content updates are picked up by the public website within approximately five seconds.

An empty MongoDB database is initialized from `data/content.json` on first content access. Existing content is preserved. Contact messages are stored in MongoDB. In Submissions, all admins share the same Done / Not done status, refreshed every 10 seconds. Existing Pending requests appear as Not done. Concurrent status changes are checked before saving.

Run `npm test` to check API routing, authentication, input validation, contact handling and content CRUD using an isolated in-memory test store. These tests do not write to your MongoDB database.

For Vercel, set the environment variables in the project settings and redeploy. For Docker/Nginx, keep the proxy request-size limit at least 4 MB to accommodate image payloads.

This file supersedes the older admin/password and instant-update instructions in SETUP.md and DEPLOY.md.

## Submission emails

Set GMAIL_USER and GMAIL_PASS (a Google App Password) in your hosting environment. The sender is always GMAIL_USER. Team notifications default to the three addresses in config/notifications.json. To notify multiple inboxes, set ADMIN_NOTIFICATION_EMAILS to a comma-separated list. Each saved request sends a branded HTML receipt with a copy of the submitted details to the customer and a separate actionable alert to the team. Both include plain-text alternatives and the WYT logo. Arabic requests receive an Arabic receipt.

Submissions shows Customer and Team delivery results. Sent means accepted by the email server, not confirmed inbox delivery. Check email connection verifies the hosting configuration without sending an email. Retry unsent emails sends only messages not recorded as Sent; older requests have no delivery record and can be sent manually. Requests remain saved if sending fails. An in-progress email attempt prevents simultaneous retries for up to two minutes.
