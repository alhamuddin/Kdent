import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";
import BrandWordmark from "./BrandWordmark";

function AnimatedHeartPulse() {
  return (
    <span className="relative inline-flex size-6 animate-heartbeat">
      <HeartPulse aria-hidden="true" className="absolute inset-0 size-full" />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full overflow-visible text-white"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          className="heartbeat-wave"
          d="M22 12h-4l-3 9L9 3l-3 9H2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    </span>
  );
}

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:py-12">
      <div className="pointer-events-none absolute -top-40 -right-32 size-[28rem] rounded-full bg-primary/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-48 -left-40 size-[30rem] rounded-full bg-highlight/5 blur-[110px]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-card/90 shadow-2xl shadow-black/30 backdrop-blur-xl lg:min-h-[42rem] lg:grid-cols-[0.88fr_1.12fr]">
        <aside className="relative hidden flex-col justify-start overflow-hidden bg-gradient-to-br from-[#183a3a] via-[#17252b] to-[#131a20] p-10 lg:flex xl:p-12">
          <div className="pointer-events-none absolute -right-24 -bottom-20 size-80 rounded-full border border-primary/10" />
          <div className="pointer-events-none absolute -right-12 -bottom-8 size-56 rounded-full border border-primary/10" />
          <div className="relative">
            <Link className="inline-flex items-center gap-3" href="/">
              <Image
                alt="K-Dent"
                className="size-11"
                height={44}
                priority
                src="/kdent-logo.svg"
                width={44}
              />
              <BrandWordmark />
            </Link>
          </div>

          <div className="relative mt-12 max-w-md xl:mt-14">
            <span className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <AnimatedHeartPulse />
            </span>
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Care, connected
            </p>
            <h2 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-white xl:text-5xl">
              A calmer way to manage your dental practice.
            </h2>
            <p className="mt-5 text-sm leading-6 text-white/60">
              Sign in to keep your patient information and day-to-day work in
              one secure place.
            </p>
          </div>

          <div className="relative mt-auto grid gap-3 pt-12 text-sm text-white/75">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-4 text-primary" />
              Secure account access
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="size-4 text-primary" />
              A clear, focused workspace
            </div>
            <Link
              className="mt-3 inline-flex w-fit items-center gap-1 text-xs text-white/45 transition hover:text-white/80"
              href="/"
            >
              Back to K-Dent <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </aside>

        <section className="flex items-center justify-center p-5 sm:p-8 lg:p-10 xl:p-14">
          <div className="w-full max-w-md">
            <Link className="mb-8 flex items-center gap-2 lg:hidden" href="/">
              <Image
                alt="K-Dent"
                height={36}
                src="/kdent-logo.svg"
                width={36}
              />
              <BrandWordmark compact />
            </Link>
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/55">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
