export const verificationEmailTemplate = (firstName: string, otp: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px;">
      <h2>Verify your email address</h2>

      <p>Hi ${firstName},</p>

      <p>
        Welcome to Stocke! Use the verification code below
        to verify your email address.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">
          ${otp}
        </span>
      </div>

      <p>This code will expire in 10 minutes.</p>

      <p>
        If you didn't create a Stocke account,
        you can safely ignore this email.
      </p>

      <p>Thanks,<br />The Stocke Team</p>
    </div>
  `;
};
