
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./FeaturedLinks.css";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedLinks({ className = "" }) {
  const wrapRef = useRef(null);
  const footerRef = useRef(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const cards = Array.from(wrap.querySelectorAll(".awkLinkCard"));
    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const played = new WeakSet();
    let queueDelay = 0;
    let queueRaf = 0;

    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

    const prime = (card) => {
      const inner = card.querySelector(".awkLinkCard__inner");
      const title = card.querySelector(".awkLinkCard__title");
      const arrowBtn = card.querySelector(".awkLinkCard__arrowBtn");
      const arrowIco = card.querySelector(".awkLinkCard__arrowIco");

      gsap.set([card, inner, title, arrowBtn, arrowIco], { clearProps: "all" });

      if (inner) {
        gsap.set(inner, {
          autoAlpha: 0,
          y: 22,
          rotateX: 9,
          transformPerspective: 900,
          transformOrigin: "50% 70%",
          willChange: "transform, opacity",
        });
      } else {
        gsap.set(card, {
          autoAlpha: 0,
          y: 22,
          rotateX: 9,
          transformPerspective: 900,
          transformOrigin: "50% 70%",
          willChange: "transform, opacity",
        });
      }

      if (title) {
        gsap.set(title, {
          autoAlpha: 0,
          y: 10,
          filter: "blur(8px)",
          willChange: "transform, opacity, filter",
        });
      }

      if (arrowBtn) {
        gsap.set(arrowBtn, {
          scale: 0.92,
          autoAlpha: 0,
          willChange: "transform, opacity",
        });
      }

      if (arrowIco) {
        gsap.set(arrowIco, { x: -2, willChange: "transform" });
      }

      return { inner, title, arrowBtn, arrowIco };
    };

    const tls = cards.map((card, i) => {
      const { inner, title, arrowBtn, arrowIco } = prime(card);
      const host = inner || card;

      const easeCard =
        i % 3 === 0 ? "expo.out" : i % 3 === 1 ? "power3.out" : "power4.out";
      const durCard = i % 3 === 0 ? 0.82 : i % 3 === 1 ? 0.68 : 0.74;

      const tl = gsap.timeline({ paused: true });

      tl.to(host, { autoAlpha: 1, y: 0, rotateX: 0, duration: durCard, ease: easeCard }, 0);

      if (title) {
        tl.to(
          title,
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.55,
            ease: "power3.out",
            onComplete: () => gsap.set(title, { clearProps: "filter" }),
          },
          0.08 + (i % 3) * 0.03
        );
      }

      if (arrowBtn) {
        tl.to(
          arrowBtn,
          { autoAlpha: 1, scale: 1, duration: 0.48, ease: "expo.out" },
          0.18 + (i % 2) * 0.04
        );
      }

      if (arrowIco) {
        tl.to(arrowIco, { x: 0, duration: 0.5, ease: "power3.out" }, 0.18);
      }

      return tl;
    });

    if (prefersReduced) {
      cards.forEach((card) => {
        const inner = card.querySelector(".awkLinkCard__inner");
        const title = card.querySelector(".awkLinkCard__title");
        const arrowBtn = card.querySelector(".awkLinkCard__arrowBtn");
        const arrowIco = card.querySelector(".awkLinkCard__arrowIco");

        gsap.set(inner || card, { autoAlpha: 1, y: 0, rotateX: 0 });
        if (title) gsap.set(title, { autoAlpha: 1, y: 0, filter: "none" });
        if (arrowBtn) gsap.set(arrowBtn, { autoAlpha: 1, scale: 1 });
        if (arrowIco) gsap.set(arrowIco, { x: 0 });
      });
    } else {
      const schedulePlay = (card, i) => {
        if (played.has(card)) return;
        const tl = tls[i];
        if (!tl) return;

        const rect = card.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const t = clamp((rect.top - vh * 0.55) / (vh * 0.45), 0, 1);
        const baseGap = 0.14;
        const extra = 0.08 * (i % 2) + 0.05 * (i % 3) + 0.10 * t;

        const delay = queueDelay + extra;

        gsap.delayedCall(delay, () => {
          if (played.has(card)) return;
          played.add(card);
          tl.play(0);
        });

        queueDelay = delay + baseGap;
        cancelAnimationFrame(queueRaf);
        queueRaf = requestAnimationFrame(() => {
          queueDelay = 0;
        });
      };

      ScrollTrigger.batch(cards, {
        start: "top 86%",
        once: true,
        onEnter: (batch) => {
          batch
            .slice()
            .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
            .forEach((el) => {
              const i = cards.indexOf(el);
              if (i >= 0) schedulePlay(el, i);
            });
        },
      });
    }

    const hoverCleanups = cards.map((card) => {
      const arrowBtn = card.querySelector(".awkLinkCard__arrowBtn");
      const arrowIco = card.querySelector(".awkLinkCard__arrowIco");

      const enter = () => {
        gsap.killTweensOf([card, arrowBtn, arrowIco]);
        gsap.to(card, {
          y: -6,
          boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
          duration: 0.26,
          ease: "power3.out",
        });
        if (arrowBtn) {
          gsap.to(arrowBtn, {
            scale: 1.06,
            duration: 0.22,
            ease: "power3.out",
          });
        }
        if (arrowIco) {
          gsap.to(arrowIco, {
            x: 2,
            duration: 0.22,
            ease: "power3.out",
          });
        }
      };

      const leave = () => {
        gsap.killTweensOf([card, arrowBtn, arrowIco]);
        gsap.to(card, {
          y: 0,
          boxShadow: "0 0 0 rgba(0,0,0,0)",
          duration: 0.26,
          ease: "power3.out",
        });
        if (arrowBtn) {
          gsap.to(arrowBtn, {
            scale: 1,
            duration: 0.22,
            ease: "power3.out",
          });
        }
        if (arrowIco) {
          gsap.to(arrowIco, {
            x: 0,
            duration: 0.22,
            ease: "power3.out",
          });
        }
      };

      card.addEventListener("mouseenter", enter);
      card.addEventListener("mouseleave", leave);
      card.addEventListener("focus", enter);
      card.addEventListener("blur", leave);

      return () => {
        card.removeEventListener("mouseenter", enter);
        card.removeEventListener("mouseleave", leave);
        card.removeEventListener("focus", enter);
        card.removeEventListener("blur", leave);
      };
    });

    const r = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(r);
      hoverCleanups.forEach((fn) => fn());
    };
  }, []);

  useLayoutEffect(() => {
    const root = footerRef.current;
    if (!root) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const tiltEls = Array.from(root.querySelectorAll(".awk-tilt"));

    gsap.set(root, { autoAlpha: 1 });

    if (!prefersReduced) {
      gsap.fromTo(
        root.querySelector(".awk-footer__top"),
        { y: 18, autoAlpha: 0, filter: "blur(10px)" },
        { y: 0, autoAlpha: 1, filter: "blur(0)", duration: 0.7, ease: "expo.out" }
      );
    }

    const cleanups = [];

    tiltEls.forEach((el, idx) => {
      const dir = idx % 2 === 0 ? -1 : 1;
      let wiggle = null;

      gsap.set(el, { rotateZ: 0, scale: 1, willChange: "transform" });

      const enter = () => {
        if (prefersReduced) return;
        gsap.to(el, {
          rotateZ: dir * 8,
          scale: 1.04,
          y: -1,
          duration: 0.32,
          ease: "expo.out",
        });
        wiggle?.kill();
        wiggle = gsap.to(el, {
          rotateZ: dir * 10,
          duration: 0.9,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
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
      href: "https://www.iae.edu.ar/2024/11/como-la-ia-esta-transformando-el-marketing-y-la-publicidad/",
    },
    {
      title:
        "IDNTITY / Sebastián Linck\ny Diego Cuervo:\nCreando el Uber de la\nagencia de medios",
      href: "https://www.circulocreativo.org/more-news/2023/11/19/latinspots-revista-176-especiales-estados-unidos",
    },
    {
      title:
        "La guerra de los clicks:\nQué cambió en la\npublicidad con el análisis\nde datos",
      href: "https://www.forbesargentina.com/negocios/la-guerra-clicks-cambio-publicidad-analisis-datos-n25646",
    },
  ];

  return (
    <section ref={wrapRef} className={`awkLinks ${className}`}>
      <div className="awkLinks__row">
        {items.map((it, i) => (
          <a
            key={i}
            className="awkLinkCard"
            href={it.href}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="blue"
          >
            <div className="awkLinkCard__inner">
              <div className="awkLinkCard__title">{it.title}</div>
              <div className="awkLinkCard__arrowWrap">
                <div className="awkLinkCard__arrowBtn">
                  <span className="awkLinkCard__arrowIco">›</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      <footer ref={footerRef} className="awk-footer awk-footer--black">
        <div className="awk-footer__inner">
          <div className="awk-footer__top">
            <div className="awk-ctaGroup">
              <a className="awk-ctaLabel" href="#">
                WORK TOGETHER
              </a>
              <span className="awk-ctaCircle">›</span>
            </div>

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

