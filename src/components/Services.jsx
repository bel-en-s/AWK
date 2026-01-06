import { useLayoutEffect, useRef } from "react";
import ServiceCard from "./ServiceCard";
import "./Services.css";

export default function Services() {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (typeof window === "undefined") return;

    let ctx;
    let ro;
    let refreshInitHandler;

    (async () => {
      const gsapMod = await import("gsap");
      const stMod = await import("gsap/ScrollTrigger");

      const gsap = gsapMod.gsap || gsapMod.default || gsapMod;
      const ScrollTrigger =
        stMod.ScrollTrigger || stMod.default || stMod;

      gsap.registerPlugin(ScrollTrigger);

      const prefersReduced =
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

      ctx = gsap.context(() => {
        const track = root.querySelector(".svc-track");
        const row = root.querySelector(".svc-row");
        if (!track || !row) return;

        const getDistance = () => Math.max(0, row.scrollWidth - track.clientWidth);

        const killPin = () => {
          ScrollTrigger.getAll()
            .filter((st) => st?.vars?.id === "services-pin")
            .forEach((st) => st.kill());
        };

        const build = () => {
          killPin();
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

        refreshInitHandler = () => gsap.set(row, { x: 0 });
        ScrollTrigger.addEventListener("refreshInit", refreshInitHandler);
        ScrollTrigger.refresh();

        ro = new ResizeObserver(() => {
          build();
          ScrollTrigger.refresh();
        });
        ro.observe(track);
        ro.observe(row);

        return () => {
          ro?.disconnect();
          ScrollTrigger.removeEventListener("refreshInit", refreshInitHandler);
          killPin();
        };
      }, root);
    })();

    return () => {
      ro?.disconnect();
      ctx?.revert();
    };
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

        {/* <div className="svc-track" aria-label="Services horizontal track">
          <div className="svc-row">
            {cards.map((c) => (
              <ServiceCard key={c.title} title={c.title} items={c.items} href={c.href} />
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
}
