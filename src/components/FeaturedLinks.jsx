// FeaturedLinks.jsx
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./FeaturedLinks.css";

export default function FeaturedLinks({ className = "" }) {
  const wrapRef = useRef(null);
  const footerRef = useRef(null);

  // ----------------------------
  // Cards hover
  // ----------------------------
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

  // ----------------------------
  // Footer intro + tilt
  // ----------------------------
  useLayoutEffect(() => {
    const root = footerRef.current;
    if (!root) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const tiltEls = Array.from(root.querySelectorAll(".awk-tilt"));
    const cleanups = [];

    const intro = () => {
      if (prefersReduced) {
        gsap.set(root, { autoAlpha: 1 });
        return;
      }

      gsap.set(root, { autoAlpha: 1 });

      const tl = gsap.timeline();
      tl.fromTo(
        root.querySelector(".awk-footer__top"),
        { y: 18, autoAlpha: 0, filter: "blur(10px)" },
        { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }
      );
      tl.fromTo(
        root.querySelector(".awk-footer__bottom"),
        { y: 14, autoAlpha: 0, filter: "blur(10px)" },
        { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.7, ease: "expo.out" },
        0.12
      );
    };

    intro();

    tiltEls.forEach((el, idx) => {
      const dir = idx % 2 === 0 ? -1 : 1;
      const BASE = 8;
      const baseRot = dir * BASE;

      let wiggle = null;

      gsap.set(el, {
        rotateZ: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        transformOrigin: "50% 50%",
        willChange: "transform",
        force3D: true,
      });

      const enter = () => {
        if (prefersReduced) return;

        gsap.to(el, {
          rotateZ: baseRot,
          scale: 1.03,
          y: -1,
          duration: 0.32,
          ease: "expo.out",
        });

        wiggle?.kill();
        wiggle = gsap.to(el, {
          rotateZ: baseRot + dir * 2,
          duration: 0.85,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      };

      const leave = () => {
        if (prefersReduced) return;

        wiggle?.kill();
        wiggle = null;

        gsap.to(el, {
          rotateZ: 0,
          scale: 1,
          y: 0,
          duration: 0.55,
          ease: "expo.out",
        });
      };

      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      el.addEventListener("focus", enter);
      el.addEventListener("blur", leave);

      cleanups.push(() => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
        el.removeEventListener("focus", enter);
        el.removeEventListener("blur", leave);
        wiggle?.kill();
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  const items = [
    {
      title: "¿Cómo la IA está\ntransformando\nel Marketing y la\nPublicidad?",
      href: "#",
    },
    {
      title:
        "IDNTITY / Sebastián Linck\ny Diego Cuervo:\nCreando el Uber de la\nagencia de medios",
      href: "#",
    },
    {
      title:
        "La guerra de los clicks:\nQué cambió en la\npublicidad con el análisis\nde datos",
      href: "#",
    },
  ];

  return (
    <section
      ref={wrapRef}
      className={`awkLinks ${className}`}
      aria-label="Featured links"
    >
      <div className="awkLinks__row">
        {items.map((it, idx) => (
          <a
            key={idx}
            className="awkLinkCard"
            href={it.href}
            data-cursor="blue"
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

      <footer
        ref={footerRef}
        className="awk-footer awk-footer--black"
        aria-label="Footer"
      >
        <div className="awk-footer__inner">
          <div className="awk-footer__top">
            <a className="awk-ctaLabel awk-tilt" href="#">
              WORK TOGETHER
            </a>
            <button className="awk-pill awk-tilt">INDEPENDIENTE</button>
            <button className="awk-pill awk-tilt">PYME</button>
            <button className="awk-pill awk-tilt">PYME +</button>
            <button className="awk-pill awk-tilt">CORPORACIÓN</button>
          </div>
        </div>
      </footer>
    </section>
  );
}
