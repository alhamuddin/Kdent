import About from "./sections/About";
import Contact from "./sections/Contact";
import { Experience } from "./sections/Experience";
import Hero from "./sections/Hero";
import Service from "./sections/Service";
import { Testimonials } from "./sections/Testimonials";
import Footer from "./components/Footer";
import { clinicDetails } from "./libs/clinic";
import { getSiteUrl } from "./libs/seo";

export default function Home() {
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: clinicDetails.name,
    description:
      "Patient-centered dental care in Chowdhury Hat, Chittagong, including dental checkups, teeth whitening, root canal treatment and tooth extraction.",
    email: clinicDetails.email,
    telephone: ["+8801978128274", "+8801812827414"],
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Arafat Tower, 2nd floor (Beside CareMax Hospital), Chowdhury Hat",
      addressLocality: "Chittagong",
      addressCountry: "BD",
    },
    areaServed: {
      "@type": "City",
      name: "Chittagong",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Dental services",
      itemListElement: [
        "Dental Checkups",
        "Teeth Whitening",
        "Root Canal Treatment",
        "Tooth Extraction",
      ].map((name) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name,
        },
      })),
    },
    ...(siteUrl ? { url: siteUrl.toString() } : {}),
  };

  return (
    <div className="min-h-screen overflow-hidden" id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <About />
      <Service />
      <Experience />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}
