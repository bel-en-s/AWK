import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ServiceCard from "./ServiceCard";
import "./Services.css";

gsap.registerPlugin(ScrollTrigger);

export default function Services() {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const ctx = gsap.context(() => {
      const track = root.querySelector(".svc-track");
      const row = root.querySelector(".svc-row");
      if (!track || !row) return;

      const getDistance = () => Math.max(0, row.scrollWidth - track.clientWidth);

      const build = () => {
        ScrollTrigger.getAll()
          .filter((st) => st?.vars?.id === "services-pin")
          .forEach((st) => st.kill());

        gsap.set(row, { x: 0 });

        const dist = getDistance();
        if (prefersReduced || dist <= 0) return;

        const tween = gsap.to(row, { x: -dist, ease: "none" });

        ScrollTrigger.create({
          id: "services-pin",
          trigger: root,
          start: "top top",
          end: () => `+=${dist}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          animation: tween,
        });
      };

      build();
      ScrollTrigger.addEventListener("refreshInit", () => gsap.set(row, { x: 0 }));
      ScrollTrigger.refresh();

      const ro = new ResizeObserver(() => {
        build();
        ScrollTrigger.refresh();
      });
      ro.observe(track);
      ro.observe(row);

      return () => {
        ro.disconnect();
        ScrollTrigger.getAll()
          .filter((st) => st?.vars?.id === "services-pin")
          .forEach((st) => st.kill());
      };
    }, root);

    return () => ctx.revert();
  }, []);

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
    <section ref={rootRef} className="svc" id="service" aria-label="Services">
      <div className="svc-inner">
        {/* Columna fija (NO scrollea) */}
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

        {/* Track scrolleable horizontal */}
        <div className="svc-track" aria-label="Services horizontal track">
          <div className="svc-row">
            {cards.map((c) => (
              <ServiceCard
                key={c.title}
                title={c.title}
                items={c.items}
                href={c.href}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
