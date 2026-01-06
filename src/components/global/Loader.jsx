import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./Loader.css";

export default function Loader() {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const title = root.querySelector(".loader-title");
    const letters = Array.from(root.querySelectorAll(".loader-letter"));
    const removed = letters.filter((el) => el.dataset.remove === "1");
    const keep = letters.filter((el) => el.dataset.remove !== "1");

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const rects = (els) => els.map((el) => el.getBoundingClientRect());

    const done = () => {
      window.__AWK_LOADED__ = true;
      window.dispatchEvent(new Event("awk:loaded"));
      // ocultar sin tocar scroll
      gsap.set(root, { autoAlpha: 0, pointerEvents: "none" });
    };

    const run = () => {
      gsap.set(root, { autoAlpha: 1, pointerEvents: "auto" });

      gsap.set(title, {
        "--gap": "0.16em",
        rotateX: -18,
        y: 8,
        filter: "blur(10px)",
        transformPerspective: 900,
        transformOrigin: "50% 50%",
        force3D: true,
      });

      gsap.set(letters, {
        autoAlpha: 0,
        y: 44,
        x: (i) => (i - 2) * 10,
        rotateX: -105,
        filter: "blur(18px)",
        transformPerspective: 900,
        transformOrigin: "50% 50%",
        force3D: true,
      });

      gsap.set(letters, { backfaceVisibility: "hidden" });

      if (prefersReduced) {
        removed.forEach((el) => (el.style.display = "none"));
        gsap.set(title, { rotateX: 0, y: 0, filter: "blur(0px)" });
        gsap.set(keep, { autoAlpha: 1, x: 0, y: 0, rotateX: 0, filter: "blur(0px)" });
        done();
        return { kill: () => {} };
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: done,
      });

      tl.to(title, { rotateX: 0, y: 0, filter: "blur(0px)", duration: 0.75, ease: "expo.out" }, 0)
        .to(
          letters,
          {
            autoAlpha: 1,
            y: 0,
            x: 0,
            rotateX: 0,
            rotateY: 0,
            filter: "blur(0px)",
            duration: 1.05,
            ease: "expo.inOut",
          },
          0.05
        )
        .to(title, { "--gap": "0.095em", duration: 0.9, ease: "expo.inOut" }, 0.15)
        .to(title, { scale: 1.02, duration: 0.35, ease: "power2.out" }, 0.6)
        .to(title, { scale: 1, duration: 0.7, ease: "expo.out" }, 0.85)
        .to({}, { duration: 0.35 })
        .to(removed, {
          autoAlpha: 0,
          x: 70,
          y: -6,
          rotateZ: 2,
          duration: 0.55,
          ease: "expo.inOut",
          stagger: 0.04,
        })
        .add(() => {
          const first = rects(keep);
          removed.forEach((el) => (el.style.display = "none"));
          root.getBoundingClientRect();
          const last = rects(keep);

          keep.forEach((el, i) => {
            const dx = first[i].left - last[i].left;
            const abs = Math.abs(dx);

            let os = 0;
            if (abs > 10) os = Math.min(10, abs * 0.06);

            const osTarget = os === 0 ? 0 : -Math.sign(dx || 1) * os;

            el.dataset.dx = dx;
            el.dataset.os = osTarget;

            gsap.set(el, { x: dx, force3D: true });
          });
        })
        .to(
          keep,
          {
            duration: 1.25,
            ease: "expo.inOut",
            stagger: { each: 0.03, from: "center" },
            force3D: true,
            keyframes: [
              { x: (i, el) => +el.dataset.dx, duration: 0 },
              { x: (i, el) => (+el.dataset.dx) * 0.22, duration: 0.26, ease: "expo.out" },
              { x: (i, el) => +el.dataset.os, duration: 0.18, ease: "power2.inOut" },
              { x: 0, duration: 0.81, ease: "expo.inOut" },
            ],
          },
          "+=0.02"
        )
        .to({}, { duration: 0.18 })
        .to(title, { y: -22, filter: "blur(6px)", duration: 0.55, ease: "power3.inOut" }, "+=0.02")
        .to(root, { scaleY: 0, duration: 1.05, ease: "power4.inOut", transformOrigin: "50% 0%" }, "<+=0.08")
        .to(root, { autoAlpha: 0, duration: 0.18, ease: "none" }, "<+=0.86");

      return tl;
    };

    let killed = false;
    let tl = null;

    // Espera fuentes si existe (no bloquea scroll)
    const fontsReady = (() => {
      const f = document.fonts;
      if (!f?.ready) return Promise.resolve();
      return f.ready.catch(() => {});
    })();

    fontsReady.then(() => {
      if (killed) return;
      tl = run();
    });

    return () => {
      killed = true;
      if (tl?.kill) tl.kill();
      gsap.set(root, { autoAlpha: 0, pointerEvents: "none" });
    };
  }, []);

  return (
    <div ref={rootRef} className="loader" aria-hidden="true">
      <div className="loader-title" aria-label="AWAKE">
        <span className="loader-letter">A</span>
        <span className="loader-letter">W</span>
        <span className="loader-letter" data-remove="1">A</span>
        <span className="loader-letter">K</span>
        <span className="loader-letter" data-remove="1">E</span>
      </div>
    </div>
  );
}
