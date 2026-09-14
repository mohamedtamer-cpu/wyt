const nodemailer = require('nodemailer');
const { buildMessages } = require('./email-templates');
const { teamRecipients } = require('./config/notifications.json');

function createMailer(env = process.env, transportFactory = nodemailer.createTransport) {
  function config() {
    const user = (env.GMAIL_USER || '').trim();
    const pass = (env.GMAIL_PASS || '').replace(/\s/g, '');
    const recipients = [...new Set((env.ADMIN_NOTIFICATION_EMAILS || teamRecipients.join(',')).split(/[,;\n]/).map(v => v.trim()).filter(Boolean))];
    if (!user || !pass || !recipients.length) throw Object.assign(new Error('Email is not configured.'), { code: 'NOT_CONFIGURED' });
    if ([user, ...recipients].some(v => !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(v))) throw Object.assign(new Error('Invalid email configuration.'), { code: 'INVALID_CONFIG' });
    return { user, pass, recipients };
  }
  function transport(c) {
    return transportFactory({ service: 'gmail', auth: { user: c.user, pass: c.pass }, connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 12000 });
  }
  const failure = error => ({ status: 'Failed', code: ['EAUTH', 'ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EENVELOPE', 'NOT_CONFIGURED', 'INVALID_CONFIG'].includes(error.code) ? error.code : 'SEND_FAILED', attemptedAt: new Date() });
  return {
    async verify() {
      try { const c = config(); await transport(c).verify(); return { ready: true, recipients: c.recipients }; }
      catch (error) { return { ready: false, code: failure(error).code }; }
    },
    async sendSubmission(submission, previous = {}) {
      let c;
      try { c = config(); } catch (error) {
        return Object.fromEntries(['customer', 'team'].map(key => [key, previous[key]?.status === 'Sent' ? previous[key] : failure(error)]));
      }
      const client = transport(c);
      const messages = buildMessages(submission, c);
      const results = await Promise.all(['customer', 'team'].map(async key => {
        if (previous[key]?.status === 'Sent') return [key, previous[key]];
        try {
          const result = await client.sendMail({ from: { name: 'WYT', address: c.user }, ...messages[key] });
          if (result.rejected?.length) throw Object.assign(new Error('Recipient rejected.'), { code: 'EENVELOPE' });
          return [key, { status: 'Sent', attemptedAt: new Date() }];
        } catch (error) { return [key, failure(error)]; }
      }));
      return Object.fromEntries(results);
    }
  };
}
module.exports = createMailer();
module.exports.createMailer = createMailer;
