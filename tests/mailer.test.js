const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createMailer } = require('../mailer');
const submission = { _id: 'reference123', email: 'customer@example.com', fullName: 'Customer', message: 'Request details', lang: 'en' };
const env = { GMAIL_USER: 'team@example.com', GMAIL_PASS: 'app password', ADMIN_NOTIFICATION_EMAILS: 'team@example.com,second@example.com' };
test('sends separate customer receipt and private team notification with correct replies', async () => {
  const sent = [];
  const mailer = createMailer(env, config => { assert.equal(config.auth.pass, 'apppassword'); return { sendMail: async message => { sent.push(message); return { rejected: [] }; }, verify: async () => true }; });
  const result = await mailer.sendSubmission(submission);
  assert.equal(result.customer.status, 'Sent'); assert.equal(result.team.status, 'Sent'); assert.equal(sent.length, 2);
  const receipt = sent.find(item => item.to === submission.email), team = sent.find(item => item.envelope);
  assert.equal(receipt.replyTo, env.GMAIL_USER); assert.match(receipt.text, /reference123/); assert.ok(!receipt.text.includes(submission.message));
  assert.equal(team.replyTo, submission.email); assert.deepEqual(team.envelope.to, ['team@example.com', 'second@example.com']); assert.match(team.text, /Request details/);
  assert.equal((await mailer.verify()).ready, true);
});
test('independent failures are recorded and retry skips already sent messages', async () => {
  let attempts = [];
  const mailer = createMailer(env, () => ({ sendMail: async message => { attempts.push(message.to); if (message.to === 'team@example.com') throw Object.assign(new Error('private SMTP response'), { code: 'EAUTH' }); return {}; } }));
  const first = await mailer.sendSubmission(submission); assert.equal(first.customer.status, 'Sent'); assert.equal(first.team.code, 'EAUTH');
  attempts = []; await mailer.sendSubmission(submission, first); assert.deepEqual(attempts, ['team@example.com']); assert.ok(!JSON.stringify(first).includes('private SMTP response'));
});
test('missing credentials report actionable failure without sending', async () => {
  const mailer = createMailer({}, () => { throw Error('must not create transport'); });
  const result = await mailer.sendSubmission(submission); assert.equal(result.customer.code, 'NOT_CONFIGURED'); assert.equal((await mailer.verify()).ready, false);
});
test('Arabic request gets Arabic acknowledgment', async () => {
  const sent = []; const mailer = createMailer(env, () => ({ sendMail: async message => { sent.push(message); return {}; } }));
  await mailer.sendSubmission({ ...submission, lang: 'ar' }); assert.match(sent[0].subject, /تم استلام طلبك/);
});
