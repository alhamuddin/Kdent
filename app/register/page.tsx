import { redirect } from "next/navigation";
import type { Metadata } from "next";
import serverSession from "../utils/serverSession";
import RegisterForm from "./registerForm";

export const metadata: Metadata = {
  title: "Create an account",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuthPage() {
  const session = await serverSession();

  if (session) {
    redirect("/dashboard");
  }
  return <RegisterForm />; //<AuthClientPage />;
}
