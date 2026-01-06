import { useLayoutEffect, useRef } from "react";
import ServiceCard from "./ServiceCard";
import "./Services.css";

export default function Services() {
  
  const cards = [
    {
      title: "Branding & Visual\nIdentity",
      items: ["Naming", "Sistemas visuales", "Guías de marca"],
      href: "#branding",
    },
    {
      title: "UX/UI & Product\nDesign",
      items: ["Websites", "Apps", "Dashboards", "Interfaces completas"],
      href: "#product",
    },
    {
      title: "Concepts &\nCampaigns",
      items: ["Conceptos", "Campañas", "Social-first"],
      href: "#campaigns",
    },
    {
      title: "Web & Motion\nDevelopment",
      items: ["Landing premium", "GSAP", "Interacciones", "3D ready"],
      href: "#dev",
    },
  ];

  return (
    <section className="svc" id="service" aria-label="Services">
      <div className="svc-inner">
        <div className="svc-fixed" aria-label="Intro card">
          <div className="svc-fixedCard">
            <p className="svc-fixedText">
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
        </div>

        <div className="svc-track" aria-label="Services horizontal track">
          <div className="svc-row">
            {cards.map((c) => (
              <ServiceCard key={c.title} title={c.title} items={c.items} href={c.href} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
