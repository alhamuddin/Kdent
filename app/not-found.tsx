import Link from "next/link";
import { ArrowLeft, CalendarPlus, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-[75vh] place-items-center bg-background px-5 py-16 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-secondary/45 p-8 text-center shadow-xl sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><SearchX className="size-7" /></span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[.18em] text-primary">404 · Page not found</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">We can’t find that page</h1>
        <p className="mt-3 text-sm leading-6 text-white/55">The page may have moved, or the address may be incorrect.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5" href="/" prefetch={false}><ArrowLeft className="size-4" />Home</Link>
          <Link className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90" href="/book-appointment"><CalendarPlus className="size-4" />Book an appointment</Link>
        </div>
      </section>
    </main>
  );
}
