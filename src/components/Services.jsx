import ServiceCard from "./ServiceCard";
import "./Services.css";

export default function Services({ inHero = false }) {
  const cards = [
    {
      variant: "service",
      title: "Branding & Visual Identity",
      items: ["Naming", "Sistemas visuales", "Guías de marca"],
      href: "#content",
    },
    {
      variant: "service",
      title: "UX/UI & Product design",
      items: ["Websites", "Apps", "Dashboards", "Interfaces Completas"],
      href: "#prototypes",
    },
    {
      variant: "service",
      title: "Creative Direction & Campaigns",
      items: ["Posicionamiento", "Narrativa de marca", "Estrategia"],
      href: "#consultoria",
    },
    {
      variant: "service",
      title: "Social Content & Motion",
      items: ["Creatividad para paid", "Social", "Banners", "y +"],
      href: "#ads",
    },
    {
      variant: "service",
      title: "Prototypes & Interactive Experiences",
      items: ["Renders", "Escena", "Producto digital"],
      href: "#3d",
    },
    {
      variant: "service",
      title: "Media & Performance",
      items: ["Renders", "Escena", "Producto digital"],
      href: "#3d",
    },
        {
      variant: "service",
      title: "3D Visual Craft",
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
                  <div className="mask"></div>
            <div className="svc-introCard" data-intro-card aria-label="Intro card">
  
              <p className="svc-introText">
                Awake™ is a digital
               
                product studio
       
                crafting memorable
     
                customer
   
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
