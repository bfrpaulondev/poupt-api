// Email service for PoupPT
// For production, integrate with SendGrid, Mailgun, or AWS SES
// For now, we log the reset URL (development mode)

const sendResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'https://poupt-pwa.vercel.app'}/reset-password?token=${resetToken}`;

  // In development, just log it
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] Password reset for ${email}: ${resetUrl}`);
    return;
  }

  // Production: integrate with email provider
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: email,
  //   from: 'noreply@poupt.pt',
  //   subject: 'PoupPT - Redefinir Palavra-passe',
  //   html: `<p>Clica <a href="${resetUrl}">aqui</a> para redefinir a tua palavra-passe. O link expira em 10 minutos.</p>`
  // });
};

const sendWelcomeEmail = async (email, name) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] Welcome email for ${name} <${email}>`);
    return;
  }
  // Production email integration
};

module.exports = { sendResetEmail, sendWelcomeEmail };
