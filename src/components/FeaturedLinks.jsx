import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./FeaturedLinks.css";

export default function FeaturedLinks({ className = "" }) {
  const wrapRef = useRef(null);
  const withBase = (p) =>
  `${import.meta.env.BASE_URL}${String(p || "").replace(/^\/+/, "")}`;

  useLayoutEffect(() => {
    
    const wrap = wrapRef.current;
    if (!wrap) return;

    const cards = Array.from(wrap.querySelectorAll(".awkLinkCard"));

    cards.forEach((card) => {
      const arrow = card.querySelector(".awkLinkCard__arrowBtn");

      const enter = () => {
        gsap.to(card, {
          y: -6,
          boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
          duration: 0.25,
          ease: "power3.out",
        });

        gsap.to(arrow, {
          x: 4,
          scale: 1.05,
          duration: 0.25,
          ease: "power3.out",
        });
      };

      const leave = () => {
        gsap.to(card, {
          y: 0,
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          duration: 0.25,
        });

        gsap.to(arrow, {
          x: 0,
          scale: 1,
          duration: 0.25,
        });
      };

      card.addEventListener("mouseenter", enter);
      card.addEventListener("mouseleave", leave);

      return () => {
        card.removeEventListener("mouseenter", enter);
        card.removeEventListener("mouseleave", leave);
      };
    });
  }, []);

  const items = [
    {
      title: "How is AI transforming marketing & vertising??",
      source: "IAE BUSINESS SCHOOL",
      href: "https://www.iae.edu.ar/2024/11/como-la-ia-esta-transformando-el-marketing-y-la-publicidad/",
    },
    {
      title: "Creating the Uber of Advertising, Brandformance.",
      source: "CIRCULO CREATIVO",
      href: "https://www.circulocreativo.org/more-news/2023/11/19/latinspots-revista-176-especiales-estados-unidos",
    },
    {
      title:
        "The battle for clicks. What changes in advertising have come with data analysis?",
      source: "FORBES",
      href: "https://www.forbesargentina.com/negocios/la-guerra-clicks-cambio-publicidad-analisis-datos-n25646",
    },
  ];

  return (
    <section ref={wrapRef} className={`awkLinks ${className}`}>
      <h2 className="awkLinks__title">PRESS</h2>

      <div className="awkLinks__row">
        {items.map((it, i) => (
          <a
            key={i}
            className="awkLinkCard"
            href={it.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="awkLinkCard__inner">
              <div className="awkLinkCard__title">{it.title}</div>

              <div className="awkLinkCard__bottom">
                <div className="awkLinkCard__source">{it.source}</div>

                <div className="awkLinkCard__arrowBtn">
                  <img
                    className="awkLinkCard__arrowIco"
                    src={withBase("images/flecha-light.png")}
                    alt=""
                  />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}