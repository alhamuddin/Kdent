import type { Metadata } from "next";
import AuthShell from "../components/AuthShell";
import ForgotPasswordForm from "./forgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      description="Enter the email address associated with your account and we’ll send you a password reset link."
      eyebrow="Account recovery"
      title="Forgot your password?"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
