"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LoaderCircle, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { resetPassword } from "../actions/auth-actions";
import { resetPasswordSchema } from "../utils/schemas";

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-white/30 focus:border-primary/70 focus:ring-4 focus:ring-primary/10 disabled:opacity-50";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    setServerError("");
    try {
      const result = await resetPassword(
        token,
        data.newPassword,
        data.confirmPassword,
      );
      if (result.error) {
        setServerError(result.error);
        return;
      }
      setSuccess(true);
    } catch {
      setServerError("Your password could not be reset. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="space-y-5">
        <p
          aria-live="polite"
          className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary"
          role="status"
        >
          Your password has been reset successfully.
        </p>
        <Link
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:outline-none"
          href="/login"
        >
          Sign in <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label
            className="mb-2 block text-sm font-medium text-white/85"
            htmlFor="newPassword"
          >
            New password
          </label>
          <input
            autoComplete="new-password"
            className={inputClassName}
            disabled={isSubmitting}
            id="newPassword"
            placeholder="Create a new password"
            type="password"
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="mt-2 text-xs text-rose-300">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-white/85"
            htmlFor="confirmPassword"
          >
            Confirm new password
          </label>
          <input
            autoComplete="new-password"
            className={inputClassName}
            disabled={isSubmitting}
            id="confirmPassword"
            placeholder="Enter your new password again"
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
              <LoaderCircle className="size-4 animate-spin" /> Resetting password
            </>
          ) : (
            <>
              Reset password <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-white/55">
        <Link
          className="font-semibold text-primary transition hover:text-white"
          href="/login"
        >
          Back to sign in
        </Link>
      </p>
    </>
  );
}
