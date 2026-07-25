"use server";

import * as z from "zod";
import { contactSchema } from "../utils/schemas";
import { transporter } from "../libs/nodemailer";

export const sendMail = async (
  data: z.infer<typeof contactSchema>,
  turnstileToken: string,
) => {
  const validation = contactSchema.safeParse(data);
  if (!validation.success) {
    return { error: "Invalid form data." };
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: turnstileToken,
      }),
    },
  );

  const verification = (await response.json()) as { success: boolean };

  if (!verification.success) {
    return { error: "Bot verification failed. Please try again." };
  }

  const { email, name, message } = validation.data;

  try {
    await transporter.sendMail({
      from: `"Website Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL,

      subject: `New message from ${name}`,

      html: `
        <h2>New Message from KDENT </h2>

        <p><strong>Name:</strong> ${name}</p>

        <p><strong>Email:</strong> ${email}</p>

        <p><strong>Message:</strong>${message}</p>

        
      `,
    });
    return { success: "email sent" };
  } catch (error) {
    return { error: "email not sent" };
  }
};
