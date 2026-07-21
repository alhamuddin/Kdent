import { FaUserDoctor } from "react-icons/fa6";
import { TbHandStop, TbRestore } from "react-icons/tb";
import { FaHandsHelping } from "react-icons/fa";

const highlights = [
  {
    icon: FaUserDoctor,
    title: "Diagnosis",
    description:
      "Accurate and comprehensive dental assessments to identify oral health issues and create effective treatment plans.",
  },
  {
    icon: TbHandStop,
    title: "Prevention",
    description:
      "Promoting lifelong oral health through preventive care, regular checkups, and personalized patient education.",
  },
  {
    icon: TbRestore,
    title: "Restoration",
    description:
      "Restoring the function, strength, and natural appearance of damaged or missing teeth with advanced restorative treatments.",
  },
  {
    icon: FaHandsHelping,
    title: "Consultation",
    description:
      "Providing honest, patient-centered consultations to help individuals understand their dental conditions and confidently choose the best treatment options.",
  },
];

function About() {
  return (
    <section id="about" className="relative overflow-hidden py-32">
      <div className="relative z-10 container mx-auto px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* left column */}

          <div className="space-y-8">
            <div className="animate-fade-in">
              <span className="text-secondary-foreground text-lg font-medium tracking-wide">
                About Me
              </span>
            </div>
            <h2 className="animate-fade-in animation-delay-100 text-secondary-foreground text-4xl leading-tight font-bold md:text-5xl">
              Elevating Smiles ,{" "}
              <span className="font-serif font-normal text-white">
                {" "}
                Through Modern Dentistry
              </span>
            </h2>
            <div className="text-muted-foreground animate-fade-in animation-delay-200 space-y-4">
              <p>
                I am Dr. Md. Khalid, a dedicated dental surgeon committed to
                providing exceptional oral healthcare through a combination of
                clinical excellence, modern technology, and compassionate
                patient care. I believe that every smile is unique, and every
                patient deserves a personalized treatment plan designed to meet
                their individual needs and long-term oral health goals.
              </p>
              <p>
                My approach focuses on prevention, accurate diagnosis, and
                minimally invasive treatment while ensuring every visit is
                comfortable and stress-free. From routine dental checkups and
                preventive care to cosmetic smile enhancements and restorative
                procedures, I strive to deliver treatments that are both
                functional and aesthetically pleasing.
              </p>
              <p>
                I continuously stay updated with the latest advancements in
                dentistry, allowing me to offer evidence-based solutions using
                advanced techniques and high-quality materials. Building lasting
                relationships with my patients through trust, transparency, and
                open communication is at the heart of my practice.
              </p>
            </div>
            <div className="glass glow-border animate-fade-in animation-delay-300 rounded-2xl p-6">
              <p className="text-foreground text-lg font-medium italic">
                My mission is simple: to help every patient achieve a healthy,
                confident smile that lasts a lifetime while making every dental
                experience comfortable, safe, and rewarding.
              </p>
            </div>
          </div>
          {/* right column */}

          <div className="grid gap-6 sm:grid-cols-2">
            {highlights.map((item, index) => (
              <div
                key={index}
                className="glass animate-fade-in rounded-2xl p-6"
                style={{
                  animationDelay: `${(index + 1) * 100}ms`,
                }}
              >
                <div className="bg-primary/10 hover:bg-primary/20 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <item.icon className="text-primary h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
