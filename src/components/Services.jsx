import ServiceCard from "./ServiceCard";
import "./Services.css";

const base = import.meta.env.BASE_URL; // ✅ acceso estático soportado
const CONTACT_URL = `${base}contact/`;

export default function Services({ inHero = false }) {
  const cards = [
    {
      variant: "service",
      title: "Branding & Visual Identity",
      items: [
        "Visual Systems",
        "Brandbook",
        "Look & Feel",
        "Brand Architecture",
        "Brand Strategy",
      ],
      href: CONTACT_URL,
    },

    {
      variant: "service",
      title: "UX/UI & Product Design",
      items: [
        "Complex Interfaces",
        "Rush Webs",
      ],
      href: CONTACT_URL,
    },

    {
      variant: "service",
      title: "Creative Direction & Campaigns",
      items: [
        "Positioning & Perception",
        "Storytelling",
        "Creative Expression",
      ],
      href: CONTACT_URL,
    },

    {
      variant: "service",
      title: "Social Content & Motion",
      items: [
        "Digital Assets",
        "Banners",
        "Social",
        "Fancy Content",
      ],
      href: CONTACT_URL,
    },

    {
      variant: "service",
      title: "Prototypes & Interactive Experiences",
      items: [
        "Bring your idea — we make it possible",
      ],
      href: CONTACT_URL,
    },

    {
      variant: "service",
      title: "Media & Performance",
      items: [
        "Appear on Google (yeap!)",
        "On Meta too",
        "Paid Media Strategy",
        "Audience Builder",
      ],
      href: CONTACT_URL,
    },

    // {
    //   variant: "service",
    //   title: "3D Visual Craft",
    //   items: [
    //     "Renders",
    //     "Scenes",
    //     "Digital Products",
    //   ],
    //   href: CONTACT_URL,
    // },

    {
      variant: "cta",
      title: "Start\na project",
      ctaLabel: "LET'S TALK",
      ctaHref: CONTACT_URL,
    },
  ];

  return (
    <section
      className={`svc ${inHero ? "svc--inHero" : ""}`}
      id="service"
      aria-label="Services"
      style={
        inHero
          ? { opacity: 0, visibility: "hidden", pointerEvents: "none" }
          : undefined
      }
    >
      <div className="svc-inner">
        <div className="svc-track" aria-label="Services horizontal track">
          <div className="svc-row">

            <div className="mask"></div>

            <div
              className="svc-introCard"
              data-intro-card
              aria-label="Intro card"
            >
              <p className="svc-introText">
                Awake™ is a digital
                <br />
                product studio
                <br />
                crafting memorable
                <br />
                customer
                <br />
                experiences.
              </p>
            </div>

            {cards.map((c) => (
              <ServiceCard key={c.title} {...c} />
            ))}

          </div>
        </div>
      </div>
    </section>
  );
}
