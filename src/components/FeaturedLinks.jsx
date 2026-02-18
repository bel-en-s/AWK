import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./FeaturedLinks.css";

export default function FeaturedLinks({ className = "" }) {
  const wrapRef = useRef(null);
  const footerRef = useRef(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const cards = Array.from(wrap.querySelectorAll(".awkLinkCard"));

    const metas = cards.map((card) => {
      const inner = card.querySelector(".awkLinkCard__inner");
      const title = card.querySelector(".awkLinkCard__title");
      const arrowBtn = card.querySelector(".awkLinkCard__arrowBtn");
      const arrowIco = card.querySelector(".awkLinkCard__arrowIco");
      return { card, inner, title, arrowBtn, arrowIco };
    });

    const ordered = () =>
      metas
        .slice()
        .sort(
          (a, b) =>
            a.card.getBoundingClientRect().left - b.card.getBoundingClientRect().left
        );

    const setOut = () => {
      metas.forEach((m) => {
        const { card, inner, title, arrowBtn, arrowIco } = m;

        gsap.killTweensOf([card, inner, title, arrowBtn, arrowIco].filter(Boolean));

        gsap.set(card, {
          y: 34,
          rotateX: 10,
          transformPerspective: 900,
          transformOrigin: "50% 70%",
          autoAlpha: 0,
          filter: "blur(6px)",
          boxShadow: "0 0 0 rgba(0,0,0,0)",
          willChange: "transform, opacity, filter",
        });

        gsap.set(card, {
          borderColor: "rgba(255,255,255,0.00)",
        });

        if (inner) {
          gsap.set(inner, {
            autoAlpha: 1,
            y: 0,
            rotateX: 0,
            filter: "none",
            willChange: "transform, opacity",
          });
        }

        if (title) {
          gsap.set(title, {
            y: 12,
            autoAlpha: 0,
            filter: "blur(10px)",
            willChange: "transform, opacity, filter",
          });
        }

        if (arrowBtn) {
          gsap.set(arrowBtn, {
            scale: 0.9,
            autoAlpha: 0,
            willChange: "transform, opacity",
          });
        }

        if (arrowIco) {
          gsap.set(arrowIco, { x: -8, willChange: "transform" });
        }
      });
    };

    const playIn = () => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      const o = ordered();

      tl.to(
        o.map((m) => m.card),
        {
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          filter: "blur(0px)",
          duration: 0.95,
          stagger: 0.14,
          overwrite: "auto",
          clearProps: "filter,transformPerspective,transformOrigin",
        },
        0
      );

      tl.to(
        o.map((m) => m.card),
        {
          borderColor: "rgba(255,255,255,0.22)",
          duration: 0.55,
          stagger: 0.14,
          ease: "power3.out",
          overwrite: "auto",
        },
        0.08
      );

      tl.to(
        o.map((m) => m.card),
        {
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
          duration: 0.7,
          stagger: 0.14,
          ease: "power2.out",
          overwrite: "auto",
        },
        0.1
      );

      o.forEach((m, i) => {
        if (m.title) {
          tl.to(
            m.title,
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.7,
              ease: "power3.out",
              overwrite: "auto",
              clearProps: "filter",
            },
            0.12 + i * 0.14
          );
        }

        if (m.arrowBtn) {
          tl.to(
            m.arrowBtn,
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.6,
              ease: "expo.out",
              overwrite: "auto",
            },
            0.2 + i * 0.14
          );
        }

        if (m.arrowIco) {
          tl.to(
            m.arrowIco,
            {
              x: 0,
              duration: 0.55,
              ease: "power3.out",
              overwrite: "auto",
            },
            0.2 + i * 0.14
          );
        }
      });

      return tl;
    };

    const playOut = () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      const o = ordered();

      tl.to(
        o.map((m) => m.card),
        {
          autoAlpha: 0,
          y: 34,
          rotateX: 10,
          filter: "blur(6px)",
          duration: 0.32,
          stagger: 0.08,
          overwrite: "auto",
        },
        0
      );

      tl.to(
        o.map((m) => m.card),
        {
          borderColor: "rgba(255,255,255,0.00)",
          duration: 0.25,
          stagger: 0.08,
          overwrite: "auto",
        },
        0
      );

      o.forEach((m, i) => {
        if (m.title) {
          tl.to(
            m.title,
            {
              autoAlpha: 0,
              y: 12,
              filter: "blur(10px)",
              duration: 0.22,
              overwrite: "auto",
            },
            0.02 + i * 0.08
          );
        }

        if (m.arrowBtn) {
          tl.to(
            m.arrowBtn,
            {
              autoAlpha: 0,
              scale: 0.9,
              duration: 0.2,
              overwrite: "auto",
            },
            0.04 + i * 0.08
          );
        }

        if (m.arrowIco) {
          tl.to(
            m.arrowIco,
            {
              x: -8,
              duration: 0.2,
              overwrite: "auto",
            },
            0.04 + i * 0.08
          );
        }
      });

      return tl;
    };

    if (prefersReduced) {
      metas.forEach((m) => {
        gsap.set(m.card, {
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          filter: "none",
          borderColor: "rgba(255,255,255,0.22)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
        });
        if (m.title) gsap.set(m.title, { autoAlpha: 1, y: 0, filter: "none" });
        if (m.arrowBtn) gsap.set(m.arrowBtn, { autoAlpha: 1, scale: 1 });
        if (m.arrowIco) gsap.set(m.arrowIco, { x: 0 });
      });
      return;
    }

    setOut();

    let inTl = null;
    let outTl = null;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          outTl?.kill();
          outTl = null;
          inTl?.kill();
          inTl = playIn();
        } else {
          inTl?.kill();
          inTl = null;
          outTl?.kill();
          outTl = playOut();
        }
      },
      { root: null, threshold: 0.18, rootMargin: "0px 0px -12% 0px" }
    );

    io.observe(wrap);

    const hoverCleanups = metas.map((m) => {
      const { card, arrowBtn, arrowIco } = m;

      const enter = () => {
        gsap.killTweensOf([card, arrowBtn, arrowIco].filter(Boolean));
        gsap.to(card, {
          y: -6,
          boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
          duration: 0.26,
          ease: "power3.out",
          overwrite: "auto",
        });
        if (arrowBtn) {
          gsap.to(arrowBtn, {
            scale: 1.06,
            duration: 0.22,
            ease: "power3.out",
            overwrite: "auto",
          });
        }
        if (arrowIco) {
          gsap.to(arrowIco, {
            x: 2,
            duration: 0.22,
            ease: "power3.out",
            overwrite: "auto",
          });
        }
      };

      const leave = () => {
        gsap.killTweensOf([card, arrowBtn, arrowIco].filter(Boolean));
        gsap.to(card, {
          y: 0,
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
          duration: 0.26,
          ease: "power3.out",
          overwrite: "auto",
        });
        if (arrowBtn) {
          gsap.to(arrowBtn, {
            scale: 1,
            duration: 0.22,
            ease: "power3.out",
            overwrite: "auto",
          });
        }
        if (arrowIco) {
          gsap.to(arrowIco, {
            x: 0,
            duration: 0.22,
            ease: "power3.out",
            overwrite: "auto",
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

    return () => {
      inTl?.kill();
      outTl?.kill();
      io.disconnect();
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
        { y: 22, autoAlpha: 0, filter: "blur(12px)" },
        { y: 0, autoAlpha: 1, filter: "blur(0)", duration: 0.85, ease: "expo.out" }
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
          overwrite: "auto",
        });
        wiggle?.kill();
        wiggle = gsap.to(el, {
          rotateZ: dir * 10,
          duration: 0.9,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          overwrite: "auto",
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
          overwrite: "auto",
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
      title: "How is AI transforming marketing & vertising??",
      href: "https://www.iae.edu.ar/2024/11/como-la-ia-esta-transformando-el-marketing-y-la-publicidad/",
    },
    {
      title:
        "Creating the Uber of Advertising, Brandformance.",
      href: "https://www.circulocreativo.org/more-news/2023/11/19/latinspots-revista-176-especiales-estados-unidos",
    },
    {
      title:
        "The battle for clicks. What changes in advertising have come with data analysis?",
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

            <button className="awk-pill awk-tilt">Independents & Professionals </button>
            <button className="awk-pill awk-tilt">Growing Businesses</button>
            <button className="awk-pill awk-tilt">Startups & Tech Products</button>
            <button className="awk-pill awk-tilt">Marketing Teams</button>
          </div>
        </div>
      </footer>
    </section>
  );
}
