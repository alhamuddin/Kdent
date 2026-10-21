"use server";

import { auth } from "@/auth";
import { APIError } from "better-auth";
import { headers } from "next/headers";
import { loginSchema, registerSchema } from "../utils/schemas";
import serverSession from "../utils/serverSession";
import { redirect } from "next/navigation";

export const signUp = async (email: string, password: string, name: string) => {
  const session = await serverSession();
  if (session) {
    return { error: "You are already logged in." };
  }

  const validation = registerSchema.safeParse({
    email,
    password,
    name,
    confirmPassword: password,
  });
  if (!validation.success) {
    return { error: "Invalid input." };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        callbackURL: "/dashboard",
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      // error.status is the HTTP-style status, error.body.code is the specific reason
      switch (error.status) {
        case 400:
          return { error: "Invalid signup information." };

        case 401:
          return { error: "Unauthorized." };

        case 403:
          return { error: "Signup is disabled." };

        case 409:
          return { error: "Email already exists." };

        case 429:
          return { error: "Too many attempts. Try again later." };

        default:
          return { error: error.message };
      }
    }
    throw error;
  }
  return { success: "User created successfully" };
};

export const signIn = async (email: string, password: string) => {
  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    return { error: "Invalid input." };
  }

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
        callbackURL: "/dashboard",
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      // error.status is the HTTP-style status, error.body.code is the specific reason
      switch (error.status) {
        case "UNAUTHORIZED":
          return { error: "Invalid email or password." };
        case "FORBIDDEN":
          return { error: "Please verify your email address first." };
        case "TOO_MANY_REQUESTS":
          return { error: "Too many attempts. Try again shortly." };
        default:
          return { error: error.message ?? "Something went wrong." };
      }
    }
    throw error;
  }
  return { success: "Signed in successfully." };
};

export const signInSocial = async (provider: "google" | "github") => {
  const { url } = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL: "/dashboard",
    },
  });
  if (url) {
    redirect(url);
  }
};

export const signOut = async () => {
  const result = await auth.api.signOut({
    headers: await headers(),
  });
  return result;
};
