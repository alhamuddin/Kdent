"use server";
import { auth } from "@/auth";
import { headers } from "next/headers";

async function serverSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export default serverSession;
