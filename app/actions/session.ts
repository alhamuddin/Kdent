"use server";

import { headers } from "next/headers";
import { auth } from "@/auth";

export async function hasActiveSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  return Boolean(session?.user);
}
