import React from "react";

import ContactForm from "../components/Contact-form";

function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden py-32">
      <div className="absolute top-0 left-0 h-full w-full">
        <div className="bg-primary/5 absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-highlight/5 absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="text-secondary-foreground animate-fade-in text-sm font-medium tracking-wider uppercase">
            Get In Touch
          </span>
          <h2 className="animate-fade-in animation-delay-100 text-secondary-foreground mt-4 mb-6 text-4xl font-bold md:text-5xl">
            Let me know,{" "}
            <span className="font-serif font-normal text-white italic">
              what&apos;s on your mind.
            </span>
          </h2>
          <p className="text-muted-foreground animate-fade-in animation-delay-200">
            Have anything to ask? Feel free to write, I will be in touch with
            you shortly.
          </p>
        </div>
        {/* Contact Info */}
        <ContactForm />
      </div>
    </section>
  );
}

export default Contact;
