"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import * as z from "zod";
import serverSession from "../utils/serverSession";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(60),
  image: z.union([z.url(), z.literal("")]),
});

const emailSchema = z.email();
const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Password must be 128 characters or fewer.")
  .regex(/[A-Z]/, "Include at least one uppercase letter.")
  .regex(/[a-z]/, "Include at least one lowercase letter.")
  .regex(/[0-9]/, "Include at least one number.")
  .regex(/[^A-Za-z0-9]/, "Include at least one special character.");

export async function updateAccountProfile(input: {
  name: string;
  image: string;
}) {
  if (!(await serverSession())) return { error: "Please sign in again." };

  const validation = profileSchema.safeParse(input);
  if (!validation.success) {
    return { error: "Enter a name and a valid image URL, or leave the image blank." };
  }

  try {
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name: validation.data.name,
        image: validation.data.image || null,
      },
    });
    return { success: "Profile updated." };
  } catch {
    return { error: "Your profile could not be updated. Please try again." };
  }
}

export async function requestAccountEmailChange(newEmail: string) {
  if (!(await serverSession())) return { error: "Please sign in again." };

  const validation = emailSchema.safeParse(newEmail.trim());
  if (!validation.success) return { error: "Enter a valid email address." };

  try {
    await auth.api.changeEmail({
      headers: await headers(),
      body: { newEmail: validation.data, callbackURL: "/patients" },
    });
    return {
      success: "Confirmation links were sent. Follow the instructions in your current and new email inboxes.",
    };
  } catch {
    return {
      error: "We could not start the email change. Check that the address is different and try again.",
    };
  }
}

export async function saveAccountPassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  if (!(await serverSession())) return { error: "Please sign in again." };

  const validation = passwordSchema.safeParse(input.newPassword);
  if (!validation.success) return { error: validation.error.issues[0]?.message };

  try {
    const requestHeaders = await headers();
    if (input.currentPassword) {
      await auth.api.changePassword({
        headers: requestHeaders,
        body: {
          currentPassword: input.currentPassword,
          newPassword: validation.data,
          revokeOtherSessions: true,
        },
      });
    } else {
      await auth.api.setPassword({
        headers: requestHeaders,
        body: { newPassword: validation.data },
      });
    }
    return { success: "Password updated. Other sessions have been signed out." };
  } catch {
    return {
      error: "Password could not be updated. Check your current password and try again.",
    };
  }
}

export async function signOutOtherSessions() {
  if (!(await serverSession())) return { error: "Please sign in again." };

  try {
    await auth.api.revokeOtherSessions({ headers: await headers() });
    return { success: "All other sessions have been signed out." };
  } catch {
    return { error: "Sessions could not be revoked. Please try again." };
  }
}

export async function requestAccountDeletion() {
  if (!(await serverSession())) return { error: "Please sign in again." };

  try {
    await auth.api.deleteUser({
      headers: await headers(),
      body: { callbackURL: "/login" },
    });
    return {
      success: "A confirmation link has been sent to your account email. Your account is deleted only after you confirm from that email.",
    };
  } catch {
    return {
      error: "We could not start account deletion. Sign in again and retry.",
    };
  }
}
