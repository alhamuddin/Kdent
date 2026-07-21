"use client";

import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState } from "react";

const testimonials = [
  {
    quote:
      "Dr. Khaled made my dental treatment completely stress-free. He explained every step clearly and ensured I was comfortable throughout the procedure. The team at K-Dent was professional, friendly, and genuinely cared about my experience.",
    author: "Sarah Ahmed",
    role: "Happy Patient",
    avatar:
      "https://images.unsplash.com/photo-1620246499808-d9fe1b7858dc?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "I had been avoiding the dentist for years because of fear, but Dr. Khaled's gentle approach changed everything. My smile looks amazing, and I now visit K-Dent with complete confidence.",
    author: "Mohammad Rahman",
    role: "Happy Patient",
    avatar:
      "https://images.unsplash.com/photo-1758336011136-343678e4fc05?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "I've had the privilege of working alongside Dr. Khaled for several years. His clinical precision, ethical practice, and commitment to continuous learning make him an outstanding dental professional and a trusted colleague.",
    author: "Dr. Ahmed Hasan",
    role: "Senior Dental Surgeon",
    avatar:
      "https://images.unsplash.com/photo-1542190891-2093d38760f2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "Dr. Khaled consistently prioritizes patient well-being while maintaining the highest standards of clinical excellence. His leadership, professionalism, and compassionate approach have earned the respect of both patients and fellow clinicians.",
    author: "Dr. Farzana Islam",
    role: "Consultant Dental Surgeon",
    avatar:
      "https://images.unsplash.com/photo-1770748034186-6d6e5738cddf?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "From the initial consultation to the final treatment, everything was handled with professionalism and attention to detail. I highly recommend Dr. Khaled and K-Dent Dental Healthcare Center to anyone seeking quality dental care.",
    author: "Nusrat Jahan",
    role: "Happy Patient",
    avatar:
      "https://images.unsplash.com/photo-1759840278361-f1adc75529a1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export const Testimonials = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  const next = () => {
    setActiveIdx((prev) => (prev + 1) % testimonials.length);
  };

  const previous = () => {
    setActiveIdx(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };
  return (
    <section id="testimonial" className="relative overflow-hidden py-32">
      <div className="bg-primary/5 absolute top-1/2 left-1/2 h-200 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="text-secondary-foreground animate-fade-in text-sm font-medium tracking-wider uppercase">
            What People Say
          </span>
          <h2 className="animate-fade-in animation-delay-100 text-secondary-foreground mt-4 mb-6 text-4xl font-bold md:text-5xl">
            Kind words from{" "}
            <span className="font-serif font-normal text-white italic">
              amazing people.
            </span>
          </h2>
        </div>

        {/* Testimonial Carousel */}
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            {/* Main Testimonial */}
            <div className="glass glow-border animate-fade-in animation-delay-200 rounded-3xl p-8 md:p-12">
              <div className="bg-primary absolute -top-4 left-8 flex h-12 w-12 items-center justify-center rounded-full">
                <Quote className="text-primary-foreground h-6 w-6" />
              </div>

              <blockquote className="mb-8 pt-4 text-xl leading-relaxed font-medium md:text-2xl">
                &quot;{testimonials[activeIdx].quote}&quot;
              </blockquote>

              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={testimonials[activeIdx].avatar}
                  alt={testimonials[activeIdx].author}
                  className="ring-primary/20 h-14 w-14 rounded-full object-cover ring-2"
                />
                <div>
                  <div className="font-semibold">
                    {testimonials[activeIdx].author}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {testimonials[activeIdx].role}
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials Navigation */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                className="glass hover:bg-primary/10 hover:text-primary rounded-full p-3 transition-all"
                onClick={previous}
              >
                <ChevronLeft />
              </button>

              <div className="flex gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      idx === activeIdx
                        ? "bg-primary w-8"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="glass hover:bg-primary/10 hover:text-primary rounded-full p-3 transition-all"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
