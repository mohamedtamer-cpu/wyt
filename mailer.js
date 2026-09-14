const nodemailer = require('nodemailer');

function createMailer(env = process.env, transportFactory = nodemailer.createTransport) {
  function config() {
    const user = (env.GMAIL_USER || '').trim();
    const pass = (env.GMAIL_PASS || '').replace(/\s/g, '');
    const recipients = [...new Set((env.ADMIN_NOTIFICATION_EMAILS || user).split(/[,;\n]/).map(v => v.trim()).filter(Boolean))];
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
      const reference = String(submission._id);
      const arabic = submission.lang === 'ar';
      const messages = {
        customer: {
          to: submission.email,
          subject: arabic ? 'WYT — تم استلام طلبك' : 'WYT — We received your request',
          text: arabic ? `شكراً لتواصلك مع WYT.\n\nتم استلام طلبك وسيقوم فريقنا بمراجعته والتواصل معك.\nرقم الطلب: ${reference}\n\nفريق WYT` : `Thank you for contacting WYT.\n\nWe received your request. Our team will review it and get in touch.\nRequest reference: ${reference}\n\nThe WYT team`,
          replyTo: c.user
        },
        team: {
          to: c.user, bcc: c.recipients.filter(address => address !== c.user),
          // Envelope contains only the configured recipients, even when the visible To is the sender.
          envelope: { from: c.user, to: c.recipients },
          subject: 'WYT — New website request',
          text: `A new request was submitted.\n\nReference: ${reference}\nName: ${submission.fullName || ''}\nEmail: ${submission.email}\nPhone: ${submission.phone || ''}\nInterest: ${submission.interest || ''}\n\nMessage:\n${submission.message || ''}\n\nManage this request: https://www.wyt.solutions/admin\nStatus: Not done`,
          replyTo: submission.email
        }
      };
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
