import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  HeartPulse,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { AnimatedBorderButton } from "../components/AnimatedBorderButton";

export const metadata: Metadata = {
  title: "Dental Services",
  description:
    "Explore dental consultations, preventive care, teeth cleaning, fillings, root canal treatment, extractions, whitening, and restorative care at K-Dent.",
  alternates: {
    canonical: "/services",
  },
};

const services = [
  {
    title: "Dental Consultation",
    category: "Personalized care",
    description:
      "Talk through your concerns, understand your options, and get a treatment plan shaped around your dental needs.",
    image: "/services/check.jpg",
    imageAlt: "Dental consultation and oral examination",
    icon: Stethoscope,
  },
  {
    title: "Routine Dental Check-up",
    category: "Preventive dentistry",
    description:
      "A careful examination helps assess your teeth and gums and spot concerns early, before they become more difficult to manage.",
    image: "/services/check.jpg",
    imageAlt: "Routine dental check-up",
    icon: BadgeCheck,
  },
  {
    title: "Scaling & Polishing",
    category: "Professional cleaning",
    description:
      "Professional cleaning helps remove plaque and tartar buildup and leaves your teeth feeling clean and refreshed.",
    image: "/services/scale.jpg",
    imageAlt: "Professional teeth scaling and polishing",
    icon: Sparkles,
  },
  {
    title: "Tooth-Colored Fillings",
    category: "Restorative dentistry",
    description:
      "A tooth-colored filling can restore a tooth affected by decay while blending naturally with your smile.",
    image: "/services/fill.jpg",
    imageAlt: "Tooth-colored dental filling",
    icon: HeartPulse,
  },
  {
    title: "Root Canal Treatment",
    category: "Tooth-saving care",
    description:
      "Treatment for an infected or inflamed tooth pulp aims to relieve the source of the problem and preserve the natural tooth.",
    image: "/services/root.jpg",
    imageAlt: "Root canal treatment illustration",
    icon: HeartPulse,
  },
  {
    title: "Dental Crowns",
    category: "Restorative dentistry",
    description:
      "A crown may be recommended to cover and protect a tooth that needs additional strength or restoration.",
    image: "/services/fill.jpg",
    imageAlt: "Dental restoration",
    icon: BadgeCheck,
  },
  {
    title: "Tooth Extraction",
    category: "Oral surgery",
    description:
      "When a tooth cannot be preserved, an extraction may be considered after a clinical examination and discussion.",
    image: "/services/extract.jpg",
    imageAlt: "Tooth extraction care",
    icon: Stethoscope,
  },
  {
    title: "Wisdom Tooth Assessment",
    category: "Oral surgery",
    description:
      "Get an assessment of wisdom-tooth discomfort and guidance on whether monitoring or further treatment is appropriate.",
    image: "/services/extract.jpg",
    imageAlt: "Wisdom tooth assessment",
    icon: Stethoscope,
  },
  {
    title: "Teeth Whitening",
    category: "Smile enhancement",
    description:
      "Discuss professional whitening options to help brighten the appearance of your teeth safely and appropriately.",
    image: "/services/white.jpg",
    imageAlt: "Teeth whitening and smile enhancement",
    icon: Sparkles,
  },
  {
    title: "Gum Health Care",
    category: "Preventive dentistry",
    description:
      "Get advice and care for gum concerns, with practical guidance to support a healthier daily oral-care routine.",
    image: "/services/scale.jpg",
    imageAlt: "Professional gum and oral health care",
    icon: HeartPulse,
  },
  {
    title: "Preventive Oral Care",
    category: "Healthy habits",
    description:
      "Learn simple, personalized ways to care for your teeth and gums between visits and help protect your long-term oral health.",
    image: "/services/check.jpg",
    imageAlt: "Preventive dental care",
    icon: BadgeCheck,
  },
  {
    title: "Smile & Treatment Planning",
    category: "Personalized care",
    description:
      "Explore suitable cosmetic or restorative options and understand the recommended steps before deciding how to proceed.",
    image: "/services/white.jpg",
    imageAlt: "Smile assessment and treatment planning",
    icon: Sparkles,
  },
];

export default function ServicesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background pb-20">
      <section
        aria-labelledby="services-heading"
        className="relative isolate overflow-hidden px-6 pt-36 pb-16 sm:pt-40 sm:pb-20"
        id="services"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 size-[38rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute top-28 -right-48 size-96 rounded-full bg-highlight/5 blur-[110px]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] bg-size-[30px_30px] opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        </div>

        <div className="container mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              <Sparkles aria-hidden="true" className="size-4" />
              Thoughtful care, tailored to you
            </span>
            <h1
              className="animate-fade-in animation-delay-100 mt-7 text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
              id="services-heading"
            >
              Care for every kind of{" "}
              <span className="font-serif font-normal text-primary italic">
                smile.
              </span>
            </h1>
            <p className="animate-fade-in animation-delay-200 mx-auto mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
              From preventive check-ups to restorative and cosmetic care, find
              the right next step for your oral health with clear guidance and
              personal attention.
            </p>
            <div className="animate-fade-in animation-delay-300 mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                href="/book-appointment"
              >
                Book an appointment
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <AnimatedBorderButton href="/#contact">
                Contact K-Dent
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </AnimatedBorderButton>
            </div>
            <div className="animate-fade-in animation-delay-400 mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-medium text-white/45">
              <span className="inline-flex items-center gap-2">
                <BadgeCheck aria-hidden="true" className="size-4 text-primary" />
                Personalised treatment guidance
              </span>
              <span className="inline-flex items-center gap-2">
                <HeartPulse aria-hidden="true" className="size-4 text-primary" />
                Preventive and restorative care
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="service-list-heading"
        className="container mx-auto max-w-7xl px-6 pt-4"
        id="service-list"
      >
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              Explore our care
            </p>
            <h2
              className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              id="service-list-heading"
            >
              Find the care you need
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-white/50">
            Every treatment starts with a conversation. We&apos;ll help you
            understand your options and choose a plan that suits you.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <article
                className="glass group animate-fade-in relative isolate overflow-hidden rounded-2xl border border-white/10 transition duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10"
                key={service.title}
                style={{ animationDelay: `${Math.min(index * 70, 700)}ms` }}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    alt={service.imageAlt}
                    className="object-cover transition duration-700 group-hover:scale-105"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={service.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c171a] via-[#0c171a]/10 to-transparent opacity-80" />
                  <span className="absolute top-4 left-4 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[11px] font-medium text-white/85 backdrop-blur-md">
                    {service.category}
                  </span>
                  <span className="absolute right-4 bottom-4 grid size-10 place-items-center rounded-xl border border-white/15 bg-black/35 text-primary backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                </div>

                <div className="space-y-3 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-primary">
                      {service.title}
                    </h3>
                    <span className="pt-1 text-xs font-semibold tracking-wider text-white/30">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="min-h-16 text-sm leading-6 text-white/55">
                    {service.description}
                  </p>
                  <Link
                    className="inline-flex items-center gap-2 pt-1 text-sm font-semibold text-primary transition hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    href="/book-appointment"
                  >
                    Ask about this service
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 pt-20">
        <div className="glass glow-border relative overflow-hidden rounded-3xl p-8 text-center sm:p-12">
          <div className="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full bg-primary/15 blur-[80px]" />
          <div className="relative mx-auto max-w-2xl">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <HeartPulse aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold text-white sm:text-3xl">
              Not sure where to start?
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/55 sm:text-base">
              Tell us what you&apos;re looking for. The K-Dent team can help you
              arrange a visit and discuss the right next step.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                href="/#contact"
              >
                Contact K-Dent
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                href="/book-appointment"
              >
                Book an appointment
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
