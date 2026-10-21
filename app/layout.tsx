import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./Navbar";
import serverSession from "./utils/serverSession";
import { getSiteUrl } from "./libs/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "K-Dent Dental Healthcare Center | Dentist in Chittagong",
    template: "%s | K-Dent",
  },
  description:
    "Looking for a dentist in Chittagong? K-Dent Dental Healthcare Center offers dental checkups, teeth whitening, root canal treatment and tooth extraction in Chowdhury Hat.",
  applicationName: "K-Dent Dental Healthcare Center",
  keywords: [
    "dentist in Chittagong",
    "dental clinic in Chittagong",
    "dentist in Chowdhury Hat",
    "dental checkup",
    "teeth whitening",
    "root canal treatment",
    "tooth extraction",
    "K-Dent Dental Healthcare Center",
  ],
  openGraph: {
    type: "website",
    locale: "en_BD",
    siteName: "K-Dent Dental Healthcare Center",
    title: "K-Dent Dental Healthcare Center | Dentist in Chittagong",
    description:
      "Patient-centered dental care in Chowdhury Hat, Chittagong, including checkups, teeth whitening, root canal treatment and tooth extraction.",
  },
  twitter: {
    card: "summary_large_image",
    title: "K-Dent Dental Healthcare Center | Dentist in Chittagong",
    description:
      "Patient-centered dental care in Chowdhury Hat, Chittagong, including checkups, teeth whitening, root canal treatment and tooth extraction.",
  },
  ...(siteUrl ? { alternates: { canonical: "/" } } : {}),
};

async function SessionNavbar() {
  const session = await serverSession();
  return <Navbar session={session} />;
}

function NavbarLoading() {
  return (
    <header aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-16 border-b border-white/5 bg-background/80 px-6 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <div className="h-8 w-28 animate-pulse rounded-md bg-white/10" />
        <div className="hidden gap-3 md:flex">
          <div className="h-8 w-14 animate-pulse rounded-full bg-white/10" />
          <div className="h-8 w-14 animate-pulse rounded-full bg-white/10" />
          <div className="h-8 w-14 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="size-9 animate-pulse rounded-full bg-white/10" />
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"

      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Suspense fallback={<NavbarLoading />}>
          <SessionNavbar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
