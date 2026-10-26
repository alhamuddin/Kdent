"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LoaderCircle, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { requestPasswordReset } from "../actions/auth-actions";
import { emailSchema } from "../utils/schemas";

export default function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: z.infer<typeof emailSchema>) => {
    setMessage("");
    setServerError("");
    try {
      const result = await requestPasswordReset(data.email);
      if (result.error) {
        setServerError(result.error);
        return;
      }
      setMessage(
        result.success ??
          "If an account exists for that email, a password reset link has been sent.",
      );
    } catch {
      setServerError("We couldn’t send the reset link. Please try again.");
    }
  };

  return (
    <>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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

        {message && (
          <p
            aria-live="polite"
            className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary"
            role="status"
          >
            {message}
          </p>
        )}

        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" /> Sending link
            </>
          ) : (
            <>
              Send reset link <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-white/55">
        Remember your password?{" "}
        <Link
          className="font-semibold text-primary transition hover:text-white"
          href="/login"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
