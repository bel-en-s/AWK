import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./Footer.css";

export default function Footer({ show = true }) {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    if (!show) return;

    const root = rootRef.current;
    if (!root) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const tiltEls = Array.from(root.querySelectorAll(".awk-tilt"));

    const cleanups = [];
    let introTl = null;

    const intro = () => {
      if (prefersReduced) {
        gsap.set(root, { autoAlpha: 1 });
        return;
      }

      introTl?.kill();
      gsap.killTweensOf(root);

      gsap.set(root, { autoAlpha: 1 });

      introTl = gsap.timeline();
      introTl.fromTo(
        root.querySelector(".awk-footer__top"),
        { y: 18, autoAlpha: 0, filter: "blur(10px)" },
        { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }
      );
      introTl.fromTo(
        root.querySelector(".awk-footer__bottom"),
        { y: 14, autoAlpha: 0, filter: "blur(10px)" },
        { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.7, ease: "expo.out" },
        0.12
      );
    };

    const ctx = gsap.context(() => {
      intro();
    }, root);

    const onPageLoad = () => intro();
    document.addEventListener("astro:page-load", onPageLoad);
    cleanups.push(() => document.removeEventListener("astro:page-load", onPageLoad));

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

    return () => {
      introTl?.kill();
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [show]);

  const base = import.meta.env.BASE_URL;
  const eyesSrc = `${base}images/ojos.svg`;
  const mail = "mailto:sebastian@awk.agency";

  return (
    <footer ref={rootRef} className="awk-footer" aria-label="Footer">
      <div className="awk-footer__inner">
        <div className="awk-footer__top" aria-label="Footer actions">
          <div className="awk-ctaGroup" aria-label="Work together">
            <a className="awk-ctaLabel awk-tilt" href={mail}>
              WORK TOGETHER
            </a>

            <a className="awk-ctaCircle awk-tilt" href={mail} aria-label="Email">
              <span className="awk-chevron" aria-hidden="true" />
            </a>
          </div>

          <button className="awk-pill awk-tilt" type="button">INDEPENDIENTE</button>
          <button className="awk-pill awk-tilt" type="button">PYME</button>
          <button className="awk-pill awk-tilt" type="button">PYME +</button>
          <button className="awk-pill awk-tilt" type="button">CORPORACIÓN</button>
        </div>

        <div className="awk-footer__bottom" aria-label="Footer info">
          <div className="awk-footer__meta awk-footer__meta--left">
            <span className="awk-footer__mono">Contact_sebastian@awk.agency</span>
          </div>

          <div className="awk-footer__logo" aria-label="AWK logo">
            <img className="awk-footer__eyes" src={eyesSrc} alt="" />
          </div>

          <div className="awk-footer__meta awk-footer__meta--right">
            <span className="awk-footer__mono">Based in_Miami_Buenos Aires</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
