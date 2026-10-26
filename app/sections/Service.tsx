import React from "react";
import { AnimatedBorderButton } from "../components/AnimatedBorderButton";
import { ArrowUpRight } from "lucide-react";
const service = [
  {
    title: "Dental Checkups",
    description:
      "Routine oral examinations, diagnosis, and preventive care to maintain healthy teeth and gums.",
    image: "/services/check.jpg",
    tags: ["Dental Checkups", "Oral Examinations", "Preventive Care"],
  },
  {
    title: "Teeth Whitening",
    description:
      "Cosmetic treatment to brighten teeth and enhance the appearance of a patient's smile.",
    image: "/services/white.jpg",
    tags: ["Teeth Whitening", "Cosmetic Dentistry", "Smile Enhancement"],
  },
  {
    title: "Root Canal Treatment",
    description:
      "Saving infected or severely damaged teeth by removing infected pulp and sealing the root canals.",
    image: "/services/root.jpg",
    tags: ["Root Canal", "Infection Treatment", "Tooth Saving"],
  },
  {
    title: "Tooth Extraction",
    description:
      "Safe removal of severely damaged, decayed, or impacted teeth when preservation is not possible.",
    image: "/services/extract.jpg",
    tags: ["Tooth Extraction", "Dental Surgery", "Tooth Removal"],
  },
  // {
  //   title: "Teeth Scaling and Polishing",
  //   description:
  //     "Professional removal of plaque, tartar, and stains to prevent cavities and gum disease.",
  //   image: "/services/scale.jpg",
  //   tags: ["Teeth Scaling", "Polishing", "Preventive Care"],
  // },
];

function Service() {
  return (
    <section id="services" className="relative overflow-hidden py-32">
      {/* Bg glows */}
      <div className="bg-primary/5 absolute top-1/4 right-0 h-96 w-96 rounded-full blur-3xl" />
      <div className="bg-highlight/5 absolute bottom-1/4 left-0 h-64 w-64 rounded-full blur-3xl" />
      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="text-secondary-foreground animate-fade-in text-sm font-medium tracking-wider uppercase">
            Featured Work
          </span>
          <h2 className="animate-fade-in animation-delay-100 text-secondary-foreground mt-4 mb-6 text-4xl font-bold md:text-5xl">
            Services that
            <span className="font-serif font-normal text-white italic">
              {" "}
              make an impact.
            </span>
          </h2>
          <p className="text-muted-foreground animate-fade-in animation-delay-200">
            A selection of our work, showcasing our expertise and commitment to
            delivering exceptional results.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-8 p-4 md:grid-cols-2">
          {service.map((service, idx) => (
            <div
              key={idx}
              className="group glass animate-fade-in overflow-hidden rounded-2xl md:row-span-1"
              style={{ animationDelay: `${(idx + 1) * 100}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="from-card via-card/50 absolute inset-0 bg-linear-to-t to-transparent opacity-60" />
                {/* Overlay Links */}
                {/* <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <a
                    href={service.link}
                    className="glass hover:bg-primary hover:text-primary-foreground rounded-full p-3 transition-all"
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </a>
                  <a
                    href={service.github}
                    className="glass hover:bg-primary hover:text-primary-foreground rounded-full p-3 transition-all"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                </div> */}
              </div>

              {/* Content */}
              <div className="space-y-4 p-6">
                <div className="flex items-start justify-between">
                  <h3 className="group-hover:text-primary text-xl font-semibold transition-colors">
                    {service.title}
                  </h3>
                  <ArrowUpRight className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <p className="text-muted-foreground text-sm">
                  {service.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className="bg-surface border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="animate-fade-in animation-delay-500 mt-12 text-center">
          <AnimatedBorderButton href="/services">
            View All Services
            <ArrowUpRight className="h-5 w-5" />
          </AnimatedBorderButton>
        </div>
      </div>
    </section>
  );
}

export default Service;
