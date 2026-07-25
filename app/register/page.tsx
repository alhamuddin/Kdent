import { redirect } from "next/navigation";
import serverSession from "../utils/serverSession";
import RegisterForm from "./registerForm";

export default async function AuthPage() {
  const session = await serverSession();

  if (session) {
    redirect("/dashboard");
  }
  return <RegisterForm />; //<AuthClientPage />;
}
