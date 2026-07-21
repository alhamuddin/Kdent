import About from "./sections/About";
import Contact from "./sections/Contact";
import { Experience } from "./sections/Experience";
import Hero from "./sections/Hero";
import Service from "./sections/Service";
import { Testimonials } from "./sections/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden">
      <Hero />
      <About />
      <Service />
      <Experience />
      <Testimonials />
      <Contact />
    </div>
  );
}
