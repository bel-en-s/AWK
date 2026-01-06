import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./Loader.css";

export default function Loader({
  text = "AWAKE",
  // timing
  inDuration = 0.6,
  outDuration = 0.55,
  hold = 0.25,
  stagger = 0.04,
}) {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // si ya cargó antes, no muestres loader
    if (window.__AWK_LOADED__) {
      gsap.set(root, { autoAlpha: 0, pointerEvents: "none" });
      return;
    }

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const title = root.querySelector(".loader-title");
    const letters = Array.from(root.querySelectorAll(".letter"));

    const done = () => {
      window.__AWK_LOADED__ = true;
      window.dispatchEvent(new Event("awk:loaded"));
      gsap.set(root, { autoAlpha: 0, pointerEvents: "none" });
    };

    // estado inicial (sin “flicker”)
    gsap.set(root, { autoAlpha: 1, pointerEvents: "auto" });
    gsap.set(title, { filter: "blur(0px)" });
    gsap.set(letters, { yPercent: 120, opacity: 0, filter: "blur(10px)" });

    if (prefersReduced) {
      // accesible: muestra un toque y oculta
      const t = window.setTimeout(done, 250);
      return () => window.clearTimeout(t);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: done,
      });

      tl.to(letters, {
        yPercent: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: inDuration,
        stagger,
        delay: 0.05,
      });

      tl.to({}, { duration: hold });

      tl.to(letters, {
        yPercent: -120,
        opacity: 0,
        filter: "blur(10px)",
        duration: outDuration,
        ease: "power3.in",
        stagger: 0.03,
      }, ">-0.05");

      tl.to(root, { autoAlpha: 0, duration: 0.2 }, "<+0.15");
    }, root);

    return () => ctx.revert();
  }, [text, inDuration, outDuration, hold, stagger]);

  return (
    <div ref={rootRef} className="loader" aria-hidden="true">
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
