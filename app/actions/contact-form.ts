"use server";

import * as z from "zod";
import { contactSchema } from "../utils/schemas";
import { sendContactEmail } from "./sendMail";
import { prisma } from "../libs/prisma";

export async function sendContactMessage(
  data: z.infer<typeof contactSchema>,
  turnstileToken: string,
) {
  const validation = contactSchema.safeParse(data);
  if (!validation.success) return { error: "Invalid form data." };
  if (!turnstileToken) return { error: "Please complete the verification." };
  if (!process.env.TURNSTILE_SECRET_KEY) {
    return { error: "Contact form verification is unavailable." };
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      },
    );
    if (!response.ok) {
      return { error: "Bot verification could not be reached. Please try again." };
    }
    const verification = (await response.json()) as { success: boolean };
    if (!verification.success) {
      return { error: "Bot verification failed. Please try again." };
    }

  } catch (error) {
    console.error("Contact form verification failed", error);
    return { error: "Bot verification could not be completed. Please try again." };
  }

  try {
    await prisma.contactMessage.create({ data: validation.data });
  } catch (error) {
    console.error("Contact message could not be saved", error);
    return { error: "Your message could not be saved. Please try again." };
  }

  try {
    await sendContactEmail(validation.data);
  } catch (error) {
    console.error("Contact message email notification failed", error);
  }

  return { success: "Your message has been sent." };
}
