import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./Loader.css";
import CursorLanding from "./CursorLanding";

export default function Loader({
  text = "AWAKE",
  inDuration = 0.65,
  outDuration = 0.55,
  hold = 0.25,
  stagger = 0.05,
}) {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.__AWK_LOADED__) {
      gsap.set(root, { autoAlpha: 0, pointerEvents: "none" });
      return;
    }

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const title = root.querySelector(".loader-title");
    const inner = root.querySelector(".loader-title-inner");
    const letters = Array.from(root.querySelectorAll(".letter"));

    if (!title || !inner || letters.length === 0) return;

    const done = () => {
      window.__AWK_LOADED__ = true;
      window.dispatchEvent(new Event("awk:loaded"));
      gsap.set(root, { autoAlpha: 0, pointerEvents: "none" });
    };

    gsap.set(root, { autoAlpha: 1, pointerEvents: "auto" });

    title.classList.remove("is-ready");

    // Estado inicial (todo arriba, sin flash)
    gsap.set(title, { filter: "blur(0px)" });
    gsap.set(inner, { y: -18, autoAlpha: 0, filter: "blur(10px)" });
    gsap.set(letters, { yPercent: -120, opacity: 0, filter: "blur(10px)" });

    title.classList.add("is-ready");

    if (prefersReduced) {
      gsap.set(inner, { y: 0, autoAlpha: 1, filter: "blur(0px)" });
      gsap.set(letters, { yPercent: 0, opacity: 1, filter: "blur(0px)" });
      const t = window.setTimeout(done, 250);
      return () => window.clearTimeout(t);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: done,
      });

      // Baja el título (desde arriba) y se enfoca
      tl.to(inner, {
        y: 0,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.55,
        ease: "expo.out",
      });

      // Letras entran desde arriba una por una
      tl.to(
        letters,
        {
          yPercent: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: inDuration,
          stagger,
          ease: "expo.out",
        },
        "<+0.05"
      );

      tl.to({}, { duration: hold });

      // Salida hacia arriba (se van para arriba)
      tl.to(
        letters,
        {
          yPercent: -120,
          opacity: 0,
          filter: "blur(10px)",
          duration: outDuration,
          ease: "power3.in",
          stagger: 0.03,
        },
        ">-0.05"
      );

      tl.to(inner, { y: -12, autoAlpha: 0, filter: "blur(10px)", duration: 0.25 }, "<+0.05");
      tl.to(root, { autoAlpha: 0, duration: 0.2 }, "<+0.12");

      return () => tl.kill();
    }, root);

    return () => ctx.revert();
  }, [text, inDuration, outDuration, hold, stagger]);

  return (
    <div ref={rootRef}  data-cursor="blue" className="loader" aria-hidden="true">
      <div className="loader-title" role="presentation">
        <span className="loader-title-inner">
          {String(text).split("").map((ch, i) => (
            <span className="letter" key={`${ch}-${i}`}>
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
