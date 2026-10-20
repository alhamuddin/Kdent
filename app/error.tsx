"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("K-Dent route error", error);
  }, [error]);

  return (
    <main className="grid min-h-[75vh] place-items-center bg-background px-5 py-16 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-rose-300/15 bg-secondary/45 p-8 text-center shadow-xl sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-400/10 text-rose-200"><AlertTriangle className="size-7" /></span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[.18em] text-rose-200">Something went wrong</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">This page couldn’t load</h1>
        <p className="mt-3 text-sm leading-6 text-white/55">Try loading the page again. If the problem continues, return home and try later.</p>
        {error.digest && <p className="mt-3 text-xs text-white/35">Reference: {error.digest}</p>}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90" onClick={() => unstable_retry()} type="button"><RotateCcw className="size-4" />Try again</button>
          <Link className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5" href="/">Return home</Link>
        </div>
      </section>
    </main>
  );
}
