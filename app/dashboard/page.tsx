import { redirect } from "next/navigation";
import serverSession from "../utils/serverSession";
import DashboardClientPage from "./dashboard-client";

export default async function DashboardPage() {
  const session = await serverSession();

  if (!session) {
    redirect("/login");
  }
  const user = session.user!;

  return <DashboardClientPage user={user} />;
}
