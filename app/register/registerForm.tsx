"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import AuthShell from "../components/AuthShell";
import Social from "../components/Social";
import { signUp } from "../actions/auth-actions";
import { registerSchema } from "../utils/schemas";

export default function RegisterForm() {
  const [serverError, setServerError] = useState("");
  const [registrationSent, setRegistrationSent] = useState(false);
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setServerError("");
    try {
      const result = await signUp(data.email, data.password, data.name);
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      setRegistrationSent(true);
    } catch {
      setServerError("Your account could not be created. Please try again.");
    }
  };

  if (registrationSent) {
    return (
      <AuthShell
        description="One quick step remains before you can sign in to K-Dent."
        eyebrow="Check your inbox"
        title="Verify your email"
      >
        <div className="space-y-5">
          <p
            aria-live="polite"
            className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm leading-6 text-primary"
            role="status"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            If this address can be registered, verification instructions have
            been sent by email. Open the link to verify your account before
            signing in. Check your spam folder if you don&apos;t see the email.
          </p>
          <Link
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:outline-none"
            href="/login"
          >
            Go to sign in <ArrowRight className="size-4" />
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      description="Create your secure workspace account and get started with K-Dent."
      eyebrow="Get started"
      title="Create your account"
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label
            className="mb-2 block text-sm font-medium text-white/85"
            htmlFor="name"
          >
            Full name
          </label>
          <input
            autoComplete="name"
            className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-white/30 focus:border-primary/70 focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
            disabled={isSubmitting}
            id="name"
            placeholder="Your name"
            type="text"
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-2 text-xs text-rose-300">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-white/85"
            htmlFor="email"
          >
            Email address
          </label>
          <input
            autoComplete="email"
            className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-white/30 focus:border-primary/70 focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
            disabled={isSubmitting}
            id="email"
            placeholder="name@clinic.com"
            type="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-2 text-xs text-rose-300">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-white/85"
            htmlFor="password"
          >
            Password
          </label>
          <input
            autoComplete="new-password"
            className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-white/30 focus:border-primary/70 focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
            disabled={isSubmitting}
            id="password"
            placeholder="Create a password"
            type="password"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-2 text-xs text-rose-300">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-white/85"
            htmlFor="confirmPassword"
          >
            Confirm password
          </label>
          <input
            autoComplete="new-password"
            className="w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-white/30 focus:border-primary/70 focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
            disabled={isSubmitting}
            id="confirmPassword"
            placeholder="Enter your password again"
            type="password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="mt-2 text-xs text-rose-300">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <p className="text-xs leading-5 text-white/45">
          Use at least 8 characters, including uppercase and lowercase letters,
          a number, and a special character.
        </p>

        {serverError && (
          <p
            aria-live="polite"
            className="flex items-start gap-2 rounded-lg border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-200"
            role="alert"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            {serverError}
          </p>
        )}

        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" /> Creating account
            </>
          ) : (
            <>
              Create account <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-[11px] font-medium tracking-[0.14em] text-white/35 uppercase">
        <span className="h-px flex-1 bg-white/10" />
        or sign up with
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <Social />

      <p className="mt-7 text-center text-sm text-white/55">
        Already have an account?{" "}
        <Link
          className="font-semibold text-primary transition hover:text-white"
          href="/login"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
