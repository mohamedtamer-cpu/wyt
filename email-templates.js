const path = require('path');
const SITE = 'https://www.wyt.solutions';
function escape(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
function button(label, href, secondary = false) {
  return `<a href="${escape(href)}" style="display:inline-block;padding:14px 22px;margin:0 8px 10px 0;border-radius:8px;background:${secondary ? '#eef1f5' : '#111827'};color:${secondary ? '#111827' : '#ffffff'};font-size:15px;font-weight:bold;text-decoration:none;">${escape(label)}</a>`;
}
function layout({ language = 'en', preheader, eyebrow, title, introduction, body, actions, closing }) {
  const rtl = language === 'ar';
  return `<!doctype html><html lang="${language}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title></head><body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Tahoma,sans-serif;color:#172033;">
<div style="display:none;font-size:1px;color:#f3f4f6;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escape(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
<tr><td style="padding:20px 28px;border-bottom:1px solid #eef0f3;"><a href="${SITE}" style="text-decoration:none;"><img src="cid:wyt-logo" width="100" height="67" alt="WYT" style="display:block;border:0;object-fit:contain;"></a><p style="margin:2px 0 0;font-size:11px;letter-spacing:2px;color:#667085;">SMART VENDING · EGYPT</p></td></tr>
<tr><td style="padding:30px 28px 12px;text-align:${rtl ? 'right' : 'left'};"><p style="margin:0 0 14px;color:#28724f;font-size:12px;font-weight:bold;letter-spacing:1px;">${escape(eyebrow)}</p><h1 style="margin:0 0 16px;font-size:30px;line-height:1.25;color:#111827;">${escape(title)}</h1><p style="margin:0;font-size:16px;line-height:1.8;color:#475467;">${escape(introduction)}</p></td></tr>
<tr><td style="padding:12px 28px;text-align:${rtl ? 'right' : 'left'};">${body}</td></tr>
<tr><td style="padding:16px 28px 28px;text-align:${rtl ? 'right' : 'left'};">${actions}<p style="font-size:14px;line-height:1.8;color:#667085;margin:10px 0 0;">${escape(closing)}</p></td></tr>
<tr><td style="padding:20px 28px;background:#fafaf8;border-top:1px solid #eef0f3;text-align:${rtl ? 'right' : 'left'};"><strong style="font-size:14px;color:#111827;">${rtl ? 'فريق WYT' : 'The WYT team'}</strong><p style="margin:6px 0 0;font-size:12px;line-height:1.6;color:#667085;">${rtl ? 'حلول بيع ذكية لمساحتك.' : 'Smart vending for your space.'} <a href="${SITE}" style="color:#475467;">wyt.solutions</a></p></td></tr>
</table></td></tr></table></body></html>`;
}
function details(submission, ar = false) {
  const missing = ar ? 'غير محدد' : 'Not provided';
  return [
    [ar ? 'الاسم' : 'Name', submission.fullName || [submission.firstName, submission.lastName].filter(Boolean).join(' ') || missing],
    [ar ? 'البريد الإلكتروني' : 'Email', submission.email || missing],
    [ar ? 'الهاتف' : 'Phone', submission.phone || missing],
    [ar ? 'الاهتمام' : 'Interested in', submission.interest || missing],
    [ar ? 'رقم الطلب' : 'Request reference', String(submission._id)]
  ];
}
function summary(submission, ar = false) {
  const rows = details(submission, ar).map(([label, value]) => `<tr><td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:12px;line-height:1.5;color:#667085;">${escape(label)}<br><strong style="font-size:15px;line-height:1.7;color:#172033;font-weight:600;overflow-wrap:anywhere;word-break:break-word;">${escape(value)}</strong></td></tr>`).join('');
  return `<h2 style="font-size:18px;margin:18px 0 14px;color:#111827;">${ar ? 'ملخص طلبك' : 'Request details'}</h2><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;table-layout:fixed;">${rows}<tr><td style="padding:16px;font-size:12px;color:#667085;">${ar ? 'الرسالة' : 'Message'}<div style="font-size:15px;color:#172033;line-height:1.8;margin-top:8px;overflow-wrap:anywhere;word-break:break-word;">${escape(submission.message || '').replace(/\r?\n/g, '<br>')}</div></td></tr></table>`;
}
function textSummary(submission, ar) {
  return details(submission, ar).map(([label, value]) => `${label}: ${value}`).join('\n') + `\n\n${ar ? 'الرسالة' : 'Message'}:\n${submission.message || ''}`;
}
function buildMessages(submission, { user, recipients }) {
  const ar = submission.lang === 'ar';
  const name = submission.firstName || submission.fullName || (ar ? 'صديقنا' : 'there');
  const customerTitle = ar ? 'شكراً لك — طلبك وصل إلينا!' : 'Thank you — your request is in!';
  const customerIntro = ar ? `أهلاً ${name}، شكراً لاختيارك WYT. يسعدنا أن نتعرف على خططك ونساعدك في إيجاد حل البيع الذكي المناسب لمساحتك. ستجد أدناه نسخة من التفاصيل التي أرسلتها.` : `Hi ${name}, thank you for reaching out to WYT. We’re excited to hear about your plans and help you explore the right vending solution for your space. Here’s a copy of what you shared with us.`;
  const next = ar ? 'ماذا بعد؟ سيراجع فريقنا طلبك ويتواصل معك لمناقشة التفاصيل والخطوات التالية.' : 'What happens next? Our team will review your request and contact you to discuss your needs and the next steps.';
  const closing = ar ? 'هل ترغب في إضافة شيء؟ يمكنك الرد مباشرة على هذا البريد — يسعدنا سماع المزيد منك.' : 'Something else you’d like us to know? Just reply to this email — we’d love to hear more.';
  const teamIntro = 'A new customer has reached out through the website. Review their details below, coordinate who will follow up, and contact them using the reply button or phone number.';
  const phone = String(submission.phone || '').replace(/[^\d+]/g, '');
  const attachments = [{ filename: 'wyt-logo.jpeg', path: path.join(__dirname, 'public/images/logo.jpeg'), cid: 'wyt-logo' }];
  return {
    customer: {
      to: submission.email, replyTo: user,
      subject: ar ? 'WYT — شكراً لك، تم استلام طلبك' : 'WYT — Thank you! We’ve received your request',
      text: `${customerTitle}\n\n${customerIntro}\n\n${textSummary(submission, ar)}\n\n${next}\n\n${closing}\n\n${ar ? 'فريق WYT' : 'The WYT team'}\n${SITE}`,
      html: layout({ language: ar ? 'ar' : 'en', preheader: ar ? 'تم استلام طلبك — إليك التفاصيل والخطوات التالية.' : 'Your request is with our team. Here are your details and what happens next.', eyebrow: ar ? 'تم استلام طلبك' : 'REQUEST RECEIVED', title: customerTitle, introduction: customerIntro, body: summary(submission, ar) + `<p style="padding:16px;background:#eff7f1;border-radius:8px;font-size:15px;line-height:1.8;color:#215d40;">${escape(next)}</p>`, actions: button(ar ? 'تواصل مع فريقنا' : 'Reply to our team', `mailto:${user}`), closing }),
      attachments
    },
    team: {
      to: recipients, envelope: { from: user, to: recipients }, replyTo: submission.email,
      subject: 'WYT — New customer request | Follow-up needed',
      text: `NEW REQUEST — NOT DONE\n\n${teamIntro}\n\n${textSummary(submission, false)}\n\nReply to customer: ${submission.email}\nOpen dashboard: ${SITE}/admin\nCoordinate with the team before contacting the customer. Mark Done in Submissions once the request has been handled.`,
      html: layout({ preheader: 'New request received. Customer details and quick follow-up actions inside.', eyebrow: 'NEW REQUEST · NOT DONE', title: 'A new opportunity to connect.', introduction: teamIntro, body: summary(submission) + '<p style="padding:16px;background:#fff8e8;border-radius:8px;font-size:14px;line-height:1.8;color:#7a5319;">Check the shared status before reaching out so two admins don’t contact the same customer. Mark the request <strong>Done</strong> once it has been handled.</p>', actions: button('Reply to customer', `mailto:${submission.email}`) + (phone && /\d/.test(phone) ? button('Call customer', `tel:${phone}`, true) : '') + button('Open submissions', `${SITE}/admin`, true), closing: 'This notification was sent to the WYT team. Replying to this message goes directly to the customer.' }),
      attachments
    }
  };
}
module.exports = { buildMessages };
