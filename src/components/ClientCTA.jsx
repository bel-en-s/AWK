import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./ClientCTA.css";

export default function ClientCTA() {
  const footerRef = useRef(null);

  useLayoutEffect(() => {
    const root = footerRef.current;
    if (!root) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const tiltEls = Array.from(root.querySelectorAll(".awk-tilt"));

    const ctx = gsap.context(() => {
      gsap.set(root, { autoAlpha: 1 });

      if (!prefersReduced) {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        tl.fromTo(
          ".awk-footer__top",
          { y: 22, autoAlpha: 0, filter: "blur(12px)" },
          { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.8 }
        );

        tiltEls.forEach((el, i) => {
          const dir = i % 2 === 0 ? -1 : 1;

          tl.fromTo(
            el,
            {
              y: 18,
              autoAlpha: 0,
              rotateZ: dir * 6,
              filter: "blur(8px)",
              scale: 0.95,
            },
            {
              y: 0,
              autoAlpha: 1,
              rotateZ: 0,
              filter: "blur(0px)",
              scale: 1,
              duration: 0.7,
            },
            0.15 + i * 0.1
          );
        });
      }

      const cleanups = [];

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
        });

        const enter = () => {
          console.log("mouseenter pill:", el.textContent);

          if (prefersReduced) return;

          gsap.to(el, {
            rotateZ: baseRot,
            rotateY: dir * 8,
            rotateX: -4,
            scale: 1.05,
            y: -1,
            duration: 0.32,
            ease: "expo.out",
            overwrite: "auto",
          });

          wiggle?.kill();

          wiggle = gsap.to(el, {
            rotateZ: baseRot + dir * 2,
            duration: 0.85,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            overwrite: "auto",
          });
        };

        const leave = () => {
          console.log("mouseleave pill:", el.textContent);

          if (prefersReduced) return;

          wiggle?.kill();
          wiggle = null;

          gsap.to(el, {
            rotateZ: 0,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            y: 0,
            duration: 0.55,
            ease: "expo.out",
            overwrite: "auto",
          });
        };

        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
        el.addEventListener("focus", enter);
        el.addEventListener("blur", leave);

        cleanups.push(() => {
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("mouseleave", leave);
          el.removeEventListener("focus", enter);
          el.removeEventListener("blur", leave);
          wiggle?.kill();
        });
      });

      return () => {
        cleanups.forEach((fn) => fn());
      };
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={footerRef} className="awk-footer">
      <div className="awk-footer__inner">
        <div className="awk-footer__top">

          <a className="awk-ctaGroup" href="/contact">
            <span className="awk-ctaLabel">WORK TOGETHER</span>
            <span className="awk-ctaCircle">›</span>
          </a>

          <button className="awk-pill awk-tilt">
            Independents & Professionals
          </button>

          <button className="awk-pill awk-tilt">
            Growing Businesses
          </button>

          <button className="awk-pill awk-tilt">
            Startups & Tech Products
          </button>

          <button className="awk-pill awk-tilt">
            Marketing Teams
          </button>

        </div>
      </div>
    </section>
  );
}