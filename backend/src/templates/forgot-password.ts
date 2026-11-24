export const forgotPasswordEmailTemplate = (
  firstName: string,
  otp: string,
): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #333333;">
      <h2 style="color: #111827;">Reset your password</h2>

      <p>Hi ${firstName},</p>

      <p>
        We received a request to reset the password for your
        Stocke account. Use the verification code below to
        proceed with resetting your password.
      </p>

      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">
          ${otp}
        </span>
      </div>

      <p>This code will expire in <strong>10 minutes</strong>.</p>

      <p>
        If you did not request a password reset, you can safely
        ignore this email. Your password will remain unchanged.
      </p>

      <p>For your security, do not share this code with anyone.</p>

      <p>
        Best regards,<br />
        The Stocke Team
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

      <p style="font-size: 12px; color: #6b7280;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;
};
