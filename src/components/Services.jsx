import ServiceCard from "./ServiceCard";
import "./Services.css";

export default function Services({ inHero = false }) {
  const cards = [
    {
      variant: "service",
      title: "Content\n& Motion",
      items: ["Visual content", "Renders", "Animaciones", "Assets para redes"],
      href: "#content",
    },
    {
      variant: "service",
      title: "Prototipos &\nExperiencias\nInteractivas",
      items: ["Flujos", "WebGL", "GSAP"],
      href: "#prototypes",
    },
    {
      variant: "service",
      title: "Consultoría\nCreativa",
      items: ["Posicionamiento", "Narrativa de marca", "Estrategia"],
      href: "#consultoria",
    },
    {
      variant: "service",
      title: "Ads &\nPerformance\nCreative",
      items: ["Creatividad para paid", "Social", "Banners", "y +"],
      href: "#ads",
    },
    {
      variant: "service",
      title: "3D & VisualCraft",
      items: ["Renders", "Escena", "Producto digital"],
      href: "#3d",
    },
    {
      variant: "cta",
      title: "Start\na project",
      ctaLabel: "LET'S TALK",
      ctaHref: "#contact",
    },
  ];

  return (
    <section
      className={`svc ${inHero ? "svc--inHero" : ""}`}
      id="service"
      aria-label="Services"
      style={
        inHero ? { opacity: 0, visibility: "hidden", pointerEvents: "none" } : undefined
      }
    >
      <div className="svc-inner">
        <div className="svc-track" aria-label="Services horizontal track">
          <div className="svc-row">
            <div className="svc-introCard" data-intro-card aria-label="Intro card">
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
