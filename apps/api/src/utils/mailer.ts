import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // e.g., 'your-email@gmail.com'
    pass: process.env.SMTP_PASS, // e.g., 'your-app-password'
  },
});

export const sendVerificationEmail = async (toEmail: string, verificationCode: string) => {
  const mailOptions = {
    from: `"CekReput" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Kode Verifikasi Pendaftaran CekReput',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 24px; text-align: center;">
          <h1 style="color: #10b981; margin: 0; font-size: 24px;">CekReput</h1>
        </div>
        <div style="padding: 32px; background-color: #ffffff;">
          <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Verifikasi Email Anda</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">
            Terima kasih telah mendaftar di CekReput. Untuk menyelesaikan pendaftaran Anda dan mulai menggunakan layanan kami, masukkan kode verifikasi 6 digit berikut:
          </p>
          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0f172a;">${verificationCode}</span>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
            Kode ini berlaku selama 10 menit. Jika Anda tidak merasa mendaftar di CekReput, abaikan email ini.
          </p>
        </div>
        <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} CekReput. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};
