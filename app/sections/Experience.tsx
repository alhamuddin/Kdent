const experiences = [
  {
    subject: "For private dental care and consultation",
    role: "Senior Dentist, Consultant & Owner",
    company: "K-Dent Dental healthcare center",
    description:
      "Compassionate dental care with advanced technology, personalized treatments, and a commitment to healthy smiles. Open 6 days in a week except Friday",
    terminology: [
      "Dental Checkups",
      "Teeth Cleaning",
      "Dental Fillings",
      "Dental Crowns",
      "Root Canal Treatment",
      "Tooth Extraction",
    ],
    current: true,
  },
  {
    subject: "Consultation and Treatment",
    role: "Visiting Dentist",
    company: "Chevron Clinical laboratory PVT LTD, Najirhat",
    description:
      "Available for consultations and treatments, providing expert dental care and guidance for patients seeking professional advice, only Friday 10am to 2pm.",
    terminology: [
      "Consultation",
      "Treatment",
      "Dental Care",
      "Professional Advice",
    ],
    current: false,
  },
  {
    subject: "Accomplishments",
    role: "Professional Achievements",
    company: "Happy Customers & Successful Treatments",
    description:
      "✓ 2,500+ Successful Treatments ✓ 800+ Happy Patients ✓ 98% Patient Satisfaction ✓ 5+ Years of Clinical Experience ✓ 150+ Smile Restorations",

    terminology: [
      "Continuous Improvement",
      "Customer Satisfaction",
      "Professional Growth",
    ],
    current: false,
  },
  {
    subject: "Education and professional credentials.",
    role: "BDS , PGT (Oral & Maxillofacial Surgery)",
    company: "Chittagong Medical College & Hospital, Chittagong",
    description:
      "Accomplished excelence in dental education and professional credentials, demonstrating a commitment to continuous learning and expertise in the field of dentistry.",
    terminology: ["BDS", "PGT", "Oral & Maxillofacial Surgery"],
    current: false,
  },
  {
    subject: "Credibility",
    role: "Professional Memberships",
    company: "Proud Member of ",
    description:
      "✓ Bangladesh Dental Society (BDS) ✓ International Association of Dental Research ✓ Bangladesh Medical & Dental Council (BMDC)",
    terminology: [" BDS", "IADR", "BMDC"],
    current: false,
  },
  {
    subject: "Buckets of knowledge and experience",
    role: "Training and Workshops",
    company: "Training and Workshops I have attended",
    description:
      "✓ Advanced training in dental Implantology & Endodontics ✓ Hands-on training in dental procedures and techniques, enhancing practical skills and clinical expertise. ✓ Attended workshops on advanced dental technologies and treatment methodologies, staying updated with the latest advancements in the field.",
    terminology: ["Hands-on Training", "Workshops", "Clinical Expertise"],
    current: false,
  },
];

export const Experience = () => {
  return (
    <section id="experience" className="relative overflow-hidden py-20">
      <div className="bg-primary/5 absolute top-1/2 left-1/4 h-96 w-96 -translate-y-1/2 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16 max-w-3xl">
          <span className="text-secondary-foreground animate-fade-in text-sm font-medium tracking-wider uppercase">
            Career Journey
          </span>
          <h2 className="animate-fade-in animation-delay-100 text-secondary-foreground mt-4 mb-6 text-4xl font-bold md:text-5xl">
            Experience that{" "}
            <span className="font-serif font-normal text-white italic">
              {" "}
              speaks volumes.
            </span>
          </h2>

          <p className="text-muted-foreground animate-fade-in animation-delay-200">
            A timeline of my professional growth, from curious beginner to
            senior engineer leading teams and building products at scale.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="timeline-glow from-primary/70 via-primary/30 absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b to-transparent shadow-[0_0_25px_rgba(32,178,166,0.8)] md:left-1/2 md:-translate-x-1/2" />

          {/* Experience Items */}
          <div className="space-y-12">
            {experiences.map((exp, idx) => (
              <div
                key={idx}
                className="animate-fade-in relative grid gap-8 md:grid-cols-2"
                style={{ animationDelay: `${(idx + 1) * 150}ms` }}
              >
                {/* Timeline Dot */}
                <div className="bg-primary ring-background absolute top-0 left-0 z-10 h-3 w-3 -translate-x-1/2 rounded-full ring-4 md:left-1/2">
                  {exp.current && (
                    <span className="bg-primary absolute inset-0 animate-ping rounded-full opacity-75" />
                  )}
                </div>

                {/* Content */}
                <div
                  className={`pl-8 md:pl-0 ${
                    idx % 2 === 0
                      ? "md:pr-16 md:text-right"
                      : "md:col-start-2 md:pl-16"
                  }`}
                >
                  <div
                    className={`glass border-primary/30 hover:border-primary/50 rounded-2xl border p-6 transition-all duration-500`}
                  >
                    <span className="text-primary text-sm font-medium">
                      {exp.subject}
                    </span>
                    <h3 className="mt-2 text-xl font-semibold">{exp.role}</h3>
                    <p className="text-muted-foreground">{exp.company}</p>
                    <p className="text-muted-foreground mt-4 text-sm">
                      {exp.description}
                    </p>
                    <div
                      className={`mt-4 flex flex-wrap gap-2 ${
                        idx % 2 === 0 ? "md:justify-end" : ""
                      }`}
                    >
                      {exp.terminology.map((tech, techIdx) => (
                        <span
                          key={techIdx}
                          className="bg-surface text-muted-foreground rounded-full px-3 py-1 text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
