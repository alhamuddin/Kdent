import { redirect } from "next/navigation";
import type { Metadata } from "next";
import serverSession from "../utils/serverSession";
import LoginForm from "./loginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string | string[] }>;
}) {
  const session = await serverSession();

  if (session) {
    redirect("/dashboard");
  }
  const params = await searchParams;
  return <LoginForm emailVerified={params.verified === "1"} />;
}
