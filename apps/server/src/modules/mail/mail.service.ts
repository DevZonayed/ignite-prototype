import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendResult {
  /** True when the message was handed to an SMTP server. */
  delivered: boolean;
}

/**
 * Transactional email.
 *
 * SMTP is configured entirely through env vars (see .env.example). When
 * SMTP_HOST is not set the service stays in "dev fallback" mode: nothing is
 * sent, the message is written to the server log instead, and callers may echo
 * the OTP back over the API so the flow is still testable end to end.
 */
@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const host = this.configService.get<string>('SMTP_HOST');
    if (!host) {
      this.logger.warn(
        'SMTP_HOST is not set, so emails will be logged to the console instead of sent.',
      );
      return;
    }

    const port = Number(this.configService.get<string>('SMTP_PORT', '587'));
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      // Implicit TLS on 465; STARTTLS everywhere else.
      secure: this.configService.get<string>('SMTP_SECURE') === 'true' || port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });

    this.logger.log(`SMTP transport ready (${host}:${port})`);
  }

  /** True when real mail can be sent. */
  get isConfigured(): boolean {
    return this.transporter !== null;
  }

  /**
   * Send a password-reset OTP. Never throws — a mail outage must not tell an
   * caller whether the address exists, and must not fail the request.
   */
  async sendPasswordResetOtp(
    to: string,
    code: string,
    expiresInMinutes: number,
  ): Promise<SendResult> {
    const subject = `${code} is your IGNITE password reset code`;
    const text = [
      'Reset your IGNITE password',
      '',
      `Your verification code is ${code}.`,
      `It expires in ${expiresInMinutes} minutes and can only be used once.`,
      '',
      'If you did not ask to reset your password you can ignore this email.',
      'Your password will not change.',
    ].join('\n');

    if (!this.transporter) {
      this.logger.warn(
        `[DEV] Password reset code for ${to}: ${code} (expires in ${expiresInMinutes}m)`,
      );
      return { delivered: false };
    }

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>(
          'MAIL_FROM',
          'IGNITE <no-reply@ignite.edu.ng>',
        ),
        to,
        subject,
        text,
        html: this.passwordResetHtml(code, expiresInMinutes),
      });
      return { delivered: true };
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${to}: ${(error as Error).message}`,
      );
      return { delivered: false };
    }
  }

  /**
   * Send an invited user the code they need to activate their account.
   * Never throws: an invite must still succeed if the mail server is down, and
   * the code is also returned to the inviter so it can be passed on by hand.
   */
  async sendInviteEmail(
    to: string,
    name: string,
    role: string,
    inviteCode: string,
  ): Promise<SendResult> {
    const readableRole = role.replace(/_/g, ' ');
    const activateUrl = this.activationUrl(role, to, inviteCode);
    const subject = `Your IGNITE invite code is ${inviteCode}`;
    const text = [
      `Hello ${name},`,
      '',
      `You have been invited to IGNITE as a ${readableRole}.`,
      '',
      `Your invite code is ${inviteCode}.`,
      '',
      'Open this link to choose a password and activate your account:',
      activateUrl,
      '',
      'The link fills the code in for you. If you would rather type it, open',
      'the IGNITE app, choose "Activate account", and enter the code above',
      'with your email address.',
    ].join('\n');

    if (!this.transporter) {
      this.logger.warn(`[DEV] Invite code for ${to}: ${inviteCode}`);
      return { delivered: false };
    }

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>(
          'MAIL_FROM',
          'IGNITE <no-reply@ignite.edu.ng>',
        ),
        to,
        subject,
        text,
        html: this.inviteHtml(name, readableRole, inviteCode, activateUrl),
      });
      return { delivered: true };
    } catch (error) {
      this.logger.error(
        `Failed to send invite email to ${to}: ${(error as Error).message}`,
      );
      return { delivered: false };
    }
  }

  /**
   * Where an invited account is activated, chosen by role: administrators work
   * in the admin portal, everyone else starts in the school portal. Both hosts
   * are configurable so a real deployment points at its own domains.
   */
  private portalUrlFor(role: string): string {
    const isAdmin = role === 'platform_admin' || role === 'curriculum_admin';
    return this.configService
      .get<string>(
        isAdmin ? 'ADMIN_PORTAL_URL' : 'SCHOOL_PORTAL_URL',
        isAdmin ? 'http://localhost:5173' : 'http://localhost:5174',
      )
      .replace(/\/+$/, '');
  }

  /**
   * Deep link to the activation page with the address and code prefilled, so
   * the recipient only has to choose a password.
   */
  private activationUrl(role: string, email: string, code: string): string {
    const query = new URLSearchParams({ email, code }).toString();
    return `${this.portalUrlFor(role)}/?${query}#activate`;
  }

  private inviteHtml(
    name: string,
    role: string,
    code: string,
    activateUrl: string,
  ): string {
    return `
<div style="margin:0;padding:32px 16px;background:#F5F7FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#FFFFFF;border:1px solid #E6EBF2;border-radius:16px;overflow:hidden;">
    <div style="background:#172554;padding:24px;">
      <span style="display:inline-block;font-size:20px;font-weight:800;letter-spacing:1.5px;color:#FFFFFF;">IGNITE</span>
    </div>
    <div style="padding:28px 24px;">
      <h1 style="margin:0 0 8px;font-size:20px;line-height:26px;color:#0F172A;">You have been invited</h1>
      <p style="margin:0 0 24px;font-size:14px;line-height:21px;color:#475569;">
        Hello ${name}, your IGNITE account has been created as a ${role}.
        Choose a password to finish setting it up.
      </p>

      <!-- Bulletproof button: table + VML so Outlook renders it too -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
        <tr>
          <td align="center" bgcolor="#1D4ED8" style="border-radius:10px;">
            <a href="${activateUrl}"
               style="display:inline-block;padding:14px 30px;font-size:15px;font-weight:700;line-height:20px;color:#FFFFFF;text-decoration:none;border-radius:10px;background:#1D4ED8;">
              Activate my account
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 10px;font-size:13px;line-height:20px;color:#475569;">
        The button fills your details in. If you need to enter the code by hand,
        it is:
      </p>
      <div style="margin:0 0 22px;padding:16px;text-align:center;background:#EFF6FF;border-radius:12px;">
        <span style="font-size:24px;font-weight:700;letter-spacing:4px;color:#1D4ED8;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">${code}</span>
      </div>

      <p style="margin:0;font-size:12px;line-height:19px;color:#94A3B8;word-break:break-all;">
        If the button does not work, paste this into your browser:<br />
        <a href="${activateUrl}" style="color:#1D4ED8;">${activateUrl}</a>
      </p>
    </div>
  </div>
</div>`.trim();
  }

  private passwordResetHtml(code: string, expiresInMinutes: number): string {
    // Inline styles only — mail clients strip <style> blocks.
    return `
<div style="margin:0;padding:32px 16px;background:#F5F7FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#FFFFFF;border:1px solid #E6EBF2;border-radius:16px;overflow:hidden;">
    <div style="background:#172554;padding:24px;">
      <span style="display:inline-block;font-size:20px;font-weight:800;letter-spacing:1.5px;color:#FFFFFF;">IGNITE</span>
    </div>
    <div style="padding:28px 24px;">
      <h1 style="margin:0 0 8px;font-size:20px;line-height:26px;color:#0F172A;">Reset your password</h1>
      <p style="margin:0 0 22px;font-size:14px;line-height:21px;color:#475569;">
        Enter this code in the IGNITE app to choose a new password.
      </p>
      <div style="margin:0 0 22px;padding:18px;text-align:center;background:#EFF6FF;border-radius:12px;">
        <span style="font-size:30px;font-weight:700;letter-spacing:8px;color:#1D4ED8;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">${code}</span>
      </div>
      <p style="margin:0 0 6px;font-size:13px;line-height:20px;color:#475569;">
        This code expires in ${expiresInMinutes} minutes and can only be used once.
      </p>
      <p style="margin:0;font-size:13px;line-height:20px;color:#64748B;">
        Didn't ask for this? Ignore this email and your password will not change.
      </p>
    </div>
  </div>
</div>`.trim();
  }
}
