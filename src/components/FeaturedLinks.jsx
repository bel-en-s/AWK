import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./FeaturedLinks.css";

export default function FeaturedLinks({ className = "" }) {
  const wrapRef = useRef(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const cards = Array.from(wrap.querySelectorAll(".awkLinkCard"));

    const cleanups = cards.map((card) => {
      const arrowBtn = card.querySelector(".awkLinkCard__arrowBtn");
      const arrowIco = card.querySelector(".awkLinkCard__arrowIco");

      gsap.set([card, arrowBtn, arrowIco], { clearProps: "all" });

      const onEnter = () => {
        gsap.killTweensOf([card, arrowBtn, arrowIco]);

        gsap.to(card, {
          y: -6,
          duration: 0.26,
          ease: "power3.out",
          boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
        });

        gsap.to(arrowBtn, {
          scale: 1.06,
          duration: 0.22,
          ease: "power3.out",
        });

        gsap.to(arrowIco, {
          x: 2,
          duration: 0.22,
          ease: "power3.out",
        });
      };

      const onLeave = () => {
        gsap.killTweensOf([card, arrowBtn, arrowIco]);

        gsap.to(card, {
          y: 0,
          duration: 0.26,
          ease: "power3.out",
          boxShadow: "0 0 0 rgba(0,0,0,0)",
        });

        gsap.to(arrowBtn, {
          scale: 1,
          duration: 0.22,
          ease: "power3.out",
        });

        gsap.to(arrowIco, {
          x: 0,
          duration: 0.22,
          ease: "power3.out",
        });
      };

      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
      card.addEventListener("focus", onEnter);
      card.addEventListener("blur", onLeave);

      return () => {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
        card.removeEventListener("focus", onEnter);
        card.removeEventListener("blur", onLeave);
      };
    });

    return () => cleanups.forEach((fn) => fn && fn());
  }, []);

  const items = [
    {
      title: "¿Cómo la IA está\ntransformando\nel Marketing y la\nPublicidad?",
      href: "https://example.com/ai-marketing",
    },
    {
      title:
        "IDNTITY / Sebastián Linck\ny Diego Cuervo:\nCreando el Uber de la\nagencia de medios",
      href: "https://example.com/idntity",
    },
    {
      title:
        "La guerra de los clicks:\nQué cambió en la\npublicidad con el análisis\nde datos",
      href: "https://example.com/guerra-clicks",
    },
  ];

  return (
    <div ref={wrapRef} className={`awkLinks ${className}`} aria-label="Featured links">
      <div className="awkLinks__row">
        {items.map((it, idx) => (
          <a
            key={idx}
            className="awkLinkCard"
            href={it.href}
            target="_blank"
            rel="noreferrer"
          >
            <div className="awkLinkCard__inner">
              <div className="awkLinkCard__title">{it.title}</div>

              <div className="awkLinkCard__arrowWrap" aria-hidden="true">
                <div className="awkLinkCard__arrowBtn">
                  <span className="awkLinkCard__arrowIco">›</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
