import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "./prisma";

export type AppRole = "USER" | "DOCTOR" | "ASSISTANT" | "ADMIN";
export type DashboardRole = Exclude<AppRole, "USER">;

export async function getCurrentUserRole() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user) redirect("/login");
  return { session, role: user.role as AppRole };
}

export async function requireDashboardAccess() {
  const access = await getCurrentUserRole();
  if (access.role === "USER") redirect("/access-pending");
  return { ...access, role: access.role as DashboardRole };
}

export async function requireStaffAccess() {
  const access = await getCurrentUserRole();
  if (access.role === "USER") redirect("/access-pending");
  return { ...access, role: access.role as DashboardRole };
}

export async function requireAppointmentManager() {
  const access = await requireStaffAccess();
  if (access.role !== "ADMIN" && access.role !== "DOCTOR" && access.role !== "ASSISTANT") redirect("/dashboard");
  return access;
}

export async function requireAdminAccess() {
  const access = await getCurrentUserRole();
  if (access.role !== "ADMIN") {
    if (access.role === "USER") redirect("/access-pending");
    redirect("/dashboard");
  }
  return access;
}
