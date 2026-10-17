import React from "react";
import { redirect } from "next/navigation";
import PatientWorkspace from "./patient-workspace";
import { headers } from "next/headers";
import { auth } from "@/auth";

async function PatientsPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) {
    redirect("/login");
  }

  const [accounts, sessions] = await Promise.all([
    auth.api.listUserAccounts({ headers: requestHeaders }),
    auth.api.listSessions({ headers: requestHeaders }),
  ]);

  const accountSettings = {
    user: {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image ?? null,
      emailVerified: session.user.emailVerified,
      createdAt: session.user.createdAt.toISOString(),
    },
    providers: accounts.map((account) => account.providerId),
    hasPassword: accounts.some((account) => account.providerId === "credential"),
    sessionCount: sessions.length,
  };

  return (
    <div className="relative z-10 min-h-screen w-full overflow-x-hidden overflow-y-auto p-5 py-5 lg:h-full lg:overflow-hidden">
      <div className="bg-primary/5 pointer-events-none absolute top-1/4 right-0 h-96 w-96 rounded-full blur-3xl" />
      <div className="bg-highlight/5 pointer-events-none absolute bottom-1/4 left-0 h-64 w-64 rounded-full blur-3xl" />
      <PatientWorkspace accountSettings={accountSettings} />
    </div>
  );
}

export default PatientsPage;
