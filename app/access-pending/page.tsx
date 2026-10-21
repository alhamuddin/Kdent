import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Account access pending",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccessPendingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-secondary/60 p-7 text-center shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Account access</p>
        <h1 className="mt-3 text-2xl font-semibold">Your account is awaiting access</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">
          An administrator needs to grant doctor access before you can open the clinical dashboard.
        </p>
        <Link className="mt-6 inline-flex rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/5" href="/">
          Return to home
        </Link>
      </section>
    </main>
  );
}
