import "server-only";

import type * as z from "zod";
import type { contactSchema } from "../utils/schemas";
import { transporter } from "../libs/nodemailer";

type ContactMessage = z.infer<typeof contactSchema>;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });

const sendKdentMail = (to: string, subject: string, html: string) =>
  transporter.sendMail({
    from: `"K-Dent" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

export async function sendContactEmail({ name, email, message }: ContactMessage) {
  await transporter.sendMail({
    from: `"K-Dent Website" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_EMAIL,
    replyTo: email,
    subject: "New message from the K-Dent website",
    html: `<h2>New message from K-Dent</h2><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Message:</strong></p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
  });
}

export async function sendNewEmailVerification(email: string, url: string) {
  await sendKdentMail(
    email,
    "Verify your K-Dent email address",
    `<p>Confirm this email address to finish setting up your K-Dent account. You must verify it before signing in.</p><p><a href="${escapeHtml(url)}">Verify email address</a></p><p>If you did not create a K-Dent account, you can ignore this email.</p>`,
  );
}

export async function sendPasswordResetEmail(email: string, url: string) {
  await sendKdentMail(
    email,
    "Reset your K-Dent password",
    `<p>A request was made to reset your K-Dent password.</p><p>This link expires in one hour and can only be used once.</p><p><a href="${escapeHtml(url)}">Reset password</a></p><p>If you did not request a password reset, you can ignore this email.</p>`,
  );
}

export async function sendEmailChangeConfirmation(
  currentEmail: string,
  newEmail: string,
  url: string,
) {
  await sendKdentMail(
    currentEmail,
    "Confirm your K-Dent email change",
    `<p>A request was made to change your K-Dent email to ${escapeHtml(newEmail)}.</p><p>Confirm this request from your current email address:</p><p><a href="${escapeHtml(url)}">Confirm email change</a></p>`,
  );
}

export async function sendAccountDeletionConfirmation(
  email: string,
  url: string,
) {
  await sendKdentMail(
    email,
    "Confirm your K-Dent account deletion",
    `<p>A request was made to permanently delete your K-Dent account.</p><p>This will remove your account and sign-in sessions. If you did not make this request, ignore this email.</p><p><a href="${escapeHtml(url)}">Confirm account deletion</a></p>`,
  );
}
