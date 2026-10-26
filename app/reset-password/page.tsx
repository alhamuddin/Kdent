import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "../components/AuthShell";
import ResetPasswordForm from "./resetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string | string[];
    error?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const token = params.token;
  const hasValidToken =
    typeof token === "string" && token.length > 0 && !params.error;

  return (
    <AuthShell
      description={
        hasValidToken
          ? "Choose a new password for your K-Dent account."
          : "This password reset link is invalid or has expired. Request a new link to continue."
      }
      eyebrow="Account recovery"
      title={hasValidToken ? "Set a new password" : "Reset link unavailable"}
    >
      {hasValidToken ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="space-y-5">
          <Link
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:outline-none"
            href="/forgot-password"
          >
            Request a new reset link
          </Link>
          <p className="text-center text-sm text-white/55">
            <Link
              className="font-semibold text-primary transition hover:text-white"
              href="/login"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  );
}
