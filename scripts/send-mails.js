// scripts/send-mails.js
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

(async () => {
  try {
    const {
      SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO
    } = process.env;

    const reportPath = path.resolve('cypress/reports/report.html');
    const exists = fs.existsSync(reportPath);

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,               // smtp.office365.com
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465, // false لــ 587 (STARTTLS)
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const html = exists
      ? `<p>Veuillez trouver le rapport Cypress en pièce jointe.</p>`
      : `<p>Le rapport HTML est introuvable. Vérifiez le job "Upload HTML report".</p>`;

    const info = await transporter.sendMail({
      from: `"QA E2E" <${SMTP_USER}>`,
      to: MAIL_TO,
      subject: 'Rapport E2E – Cypress',
      html,
      attachments: exists ? [{ filename: 'report.html', path: reportPath }] : [],
    });

    console.log('Mail sent:', info.messageId);
  } catch (e) {
    console.error('Mail error:', e.message);
    process.exit(0); // ما نطيّحوش CI
  }
})();
