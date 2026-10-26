/* eslint-disable react-hooks/purity */
/* eslint-disable @next/next/no-img-element */
import React from "react";
import { AnimatedBorderButton } from "../components/AnimatedBorderButton";
import { ArrowRight, ChevronDown, Download } from "lucide-react";
import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import Link from "next/link";

const skills = [
  "Diagnosis",
  "Prevention",
  "Precision",
  "Aesthetics",
  "Restoration",
  "Implants",
  "Whitening",
  "Veneers",
  "Endodontics",
  "Orthodontics",
  "Surgery",
  "Consultation",
  "Compassion",
  "Communication",
  "Hygiene",
  "Sterilization",
  "Innovation",
  "Planning",
  "Empathy",
  "Excellence",
];

function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* Bg */}

      <div className="absolute inset-0">
        <img
          src="/hero-bg.jpg"
          alt="bg"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="from-background/20 via-background/80 to-background absolute inset-0 bg-linear-to-b"></div>
      </div>
      {/* green dots */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(40)].map((_, index) => (
          <div
            key={index}
            className="absolute h-1.5 w-1.5 rounded-full opacity-60"
            style={{
              backgroundColor: "#20B2A6",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `slow-drift ${15 + Math.random() * 20}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* left column */}
          <div className="space-y-8">
            <div className="animate-fade-in">
              <span className="glass text-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm">
                <span className="bg-primary h-2 w-2 animate-pulse rounded-full" />
                Oral & Maxillofacial Surgeon
              </span>
            </div>
            {/* Headline */}
            <div className="space-y-4">
              <h1 className="animate-fade-in animation-delay-100 max-w-2xl text-5xl leading-tight font-bold md:text-6xl lg:text-7xl">
                Crafting <br />
                <span className="text-primary glow-text">Beautiful Smiles</span>
                <br />
                with
                <br />
                <span className="font-serif font-normal text-white">
                  Precision
                </span>
              </h1>
              <p className="text-muted-foreground animation-delay-200 animate-fade-in max-w-lg text-lg">
                Dedicated to preventive, restorative, and cosmetic dentistry,
                Dr. Khaled provides comprehensive care tailored to each
                patient&apos;s unique needs, ensuring comfort, long-term oral
                health, and exceptional treatment outcomes.
              </p>
            </div>
            {/* cta */}
            <div className="animate-fade-in animation-delay-400 flex flex-wrap items-center gap-4">
              <Link
                className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                href="#contact"
              >
                Contact Me <ArrowRight className="h-5 w-5" />
              </Link>
              <AnimatedBorderButton>
                <Download className="h-5 w-5" />
                Download CV
              </AnimatedBorderButton>
            </div>
            {/* social links */}
            <div className="animate-fade-in animation-delay-400 flex items-center gap-4">
              <span className="text-muted-foreground text-sm">Follow me: </span>
              {[
                { icon: FaFacebook, href: "#" },
                { icon: FaLinkedin, href: "#" },
                { icon: FaTwitter, href: "#" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  className="glass hover:bg-primary/10 hover:text-primary rounded-full p-2 transition-all duration-300"
                >
                  {<social.icon className="h-5 w-5" />}
                </a>
              ))}
            </div>
          </div>
          {/* Right column */}
          <div>
            {/* profile image */}
            <div className="relative mx-auto max-w-md">
              <div className="from-primary/30 to-primary/10 absolute inset-0 animate-pulse rounded-3xl bg-gradient-to-br via-transparent blur-2xl" />
              <div className="glass glow-border relative rounded-3xl p-2">
                <img
                  src="/profile-photo.jpg"
                  alt="Pedro Machado"
                  className="aspect-4/5 w-full rounded-2xl object-cover"
                />

                {/* Floating Badge */}
                <div className="glass animate-float absolute -right-4 -bottom-4 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
                    <span className="text-sm font-medium">
                      Available for Consultation
                    </span>
                  </div>
                </div>
                {/* Stats Badge */}
                <div className="glass animate-float animation-delay-500 absolute -top-4 -left-4 rounded-xl px-4 py-3">
                  <div className="text-primary text-2xl font-bold">5+</div>
                  <div className="text-muted-foreground text-xs">
                    Years Exp.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* skills section */}
        <div className="aniamate-fade-in animation-delay-600 mt-20">
          <p className="text-muted-foreground mb-6 text-center text-lg">
            We are expert in
          </p>
          <div className="relative overflow-hidden">
            <div className="animate-marquee flex">
              {[...skills, ...skills].map((skill, index) => (
                <div className="shrink-0 px-8 py-4" key={index}>
                  <span className="text-muted-foreground/50 hover:text-muted-foreground text-xl font-semibold transition-colors">
                    {skill}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="animate-fade-in animation-delay-800 absolute bottom-8 left-1/2 -translate-x-1/2">
        <a
          href="#about"
          className="text-muted-foreground hover:text-primary group flex flex-col items-center gap-2 transition-colors"
        >
          <span className="text-xs tracking-wider uppercase">Scroll</span>
          <ChevronDown className="h-6 w-6 animate-bounce" />
        </a>
      </div>
    </section>
  );
}

export default Hero;
