import { redirect } from "next/navigation";
import serverSession from "../utils/serverSession";
import LoginForm from "./loginForm";

export default async function LoginPage() {
  const session = await serverSession();

  if (session) {
    redirect("/dashboard");
  }
  return <LoginForm />; //<AuthClientPage />;
}
