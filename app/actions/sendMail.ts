"use server";

import * as z from "zod";
import { contactSchema } from "../utils/schemas";
import { transporter } from "../libs/nodemailer";

export const sendMail = async (data: z.infer<typeof contactSchema>) => {
  const { email, name, message } = data;

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
