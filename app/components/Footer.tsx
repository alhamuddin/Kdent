import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import BrandWordmark from "./BrandWordmark";

const footerLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
  { label: "Brochure", href: "/brochure" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0b1013]">
      <div className="container mx-auto max-w-7xl px-6 pt-12 pb-6 sm:pt-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.25fr_.75fr_1fr] lg:gap-14">
          <div className="max-w-sm">
            <Link href="/" aria-label="K-Dent home" className="inline-flex">
              <BrandWordmark />
            </Link>
            <p className="mt-5 text-sm leading-6 text-white/55">
              Thoughtful dental care, clear guidance, and a more connected
              experience for every patient.
            </p>
            <Link
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/10"
              href="/book-appointment"
            >
              Book an appointment <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="text-xs font-semibold tracking-[.16em] text-white/80 uppercase">
              Explore
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-1">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    className="text-sm text-white/55 transition hover:text-primary"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="text-xs font-semibold tracking-[.16em] text-white/80 uppercase">
              Get in touch
            </h2>
            <address className="mt-4 grid gap-4 not-italic">
              <a className="flex min-w-0 items-start gap-3 text-sm text-white/55 transition hover:text-primary" href="tel:+8801978128274">
                <Phone aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={16} />
                <span>01978-128274, 01812-827414</span>
              </a>
              <a className="flex min-w-0 items-start gap-3 text-sm text-white/55 transition hover:text-primary" href="mailto:kdenthc@gmail.com">
                <Mail aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={16} />
                <span className="break-all">kdenthc@gmail.com</span>
              </a>
              <a className="flex min-w-0 items-start gap-3 text-sm leading-6 text-white/55 transition hover:text-primary" href="https://maps.app.goo.gl/cerjVeKXCiqtc5na9" target="_blank" rel="noreferrer">
                <MapPin aria-hidden="true" className="mt-1 shrink-0 text-primary" size={16} />
                <span>Arafat Tower, 2nd floor, Chowdhury Hat, Chittagong</span>
              </a>
            </address>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} K-Dent Dental Healthcare Center</span>
          <a className="inline-flex items-center gap-1.5 transition hover:text-primary" href="#top">
            Back to top <ArrowUpRight aria-hidden="true" size={13} className="-rotate-45" />
          </a>
        </div>
      </div>
    </footer>
  );
}
