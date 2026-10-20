import React from "react";
import PatientWorkspace from "./patient-workspace";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { getDashboardData } from "./dashboard-data";
import { prisma } from "@/app/libs/prisma";
import { requireDashboardAccess } from "@/app/libs/authorization";
import { getCurrentUserRole } from "@/app/libs/authorization";
import { loadPatientPortal } from "@/app/actions/appointment-portal";
import PatientPortal from "./PatientPortal";
import AccountSettings from "./content/AccountSettings";

async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string | string[] }>;
}) {
  const params = await searchParams;
  const showProfile = params.section === "settings";
  const access = await getCurrentUserRole();
  if (access.role === "USER") {
    if (showProfile) {
      const requestHeaders = await headers();
      const [accounts, sessionCount] = await Promise.all([
        auth.api.listUserAccounts({ headers: requestHeaders }),
        prisma.session.count({
          where: { userId: access.session.user.id, expiresAt: { gt: new Date() } },
        }),
      ]);
      return (
        <div className="min-h-screen w-full overflow-y-auto p-5 py-5">
          <AccountSettings
            user={{
              name: access.session.user.name,
              email: access.session.user.email,
              image: access.session.user.image ?? null,
              emailVerified: access.session.user.emailVerified,
              createdAt: access.session.user.createdAt.toISOString(),
            }}
            providers={accounts.map((account) => account.providerId)}
            hasPassword={accounts.some((account) => account.providerId === "credential")}
            sessionCount={sessionCount}
            role="USER"
          />
        </div>
      );
    }
    const data = await loadPatientPortal();
    return <PatientPortal data={data} userName={access.session.user.name} />;
  }
  const requestHeaders = await headers();
  const { session, role } = await requireDashboardAccess();

  const [accounts, sessionCount, dashboardData] = await Promise.all([
    auth.api.listUserAccounts({ headers: requestHeaders }),
    prisma.session.count({
      where: { userId: session.user.id, expiresAt: { gt: new Date() } },
    }),
    getDashboardData(),
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
    sessionCount,
    role,
  };

  return (
    <div className="relative z-10 min-h-screen w-full overflow-x-hidden overflow-y-auto p-5 py-5 lg:h-full lg:overflow-hidden">
      <div className="bg-primary/5 pointer-events-none absolute top-1/4 right-0 h-96 w-96 rounded-full blur-3xl" />
      <div className="bg-highlight/5 pointer-events-none absolute bottom-1/4 left-0 h-64 w-64 rounded-full blur-3xl" />
      <PatientWorkspace
        accountSettings={accountSettings}
        dashboardData={dashboardData}
        initialSection={showProfile ? "settings" : "dashboard"}
      />
    </div>
  );
}

export default PatientsPage;
