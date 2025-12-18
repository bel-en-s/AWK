import gsap from "gsap";
import "./Loader.css";
import { useLayoutEffect, useRef } from "react";

export default function Loader() {
  const rootRef = useRef(null);
  const lockRef = useRef({ sbw: 0 });

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const title = root.querySelector(".loader-title");
    const letters = Array.from(root.querySelectorAll(".letter"));
    const removed = letters.filter((el) => el.dataset.remove === "1");
    const keep = letters.filter((el) => el.dataset.remove !== "1");

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const rects = (els) => els.map((el) => el.getBoundingClientRect());

    const lockScroll = () => {
      const sbw = window.innerWidth - document.documentElement.clientWidth;
      lockRef.current.sbw = sbw;

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;

      const l = window.lenis || window.__lenis;
      if (l && typeof l.stop === "function") l.stop();
    };

    const unlockScroll = () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      const l = window.lenis || window.__lenis;
      if (l && typeof l.start === "function") l.start();
    };

    lockScroll();

    const done = () => {
      window.__AWK_LOADED__ = true;
      window.dispatchEvent(new Event("awk:loaded"));
      gsap.set(root, { pointerEvents: "none" });
      unlockScroll();
    };

    const run = () => {
      gsap.set(root, {
        autoAlpha: 1,
        pointerEvents: "auto",
        scaleY: 1,
        transformOrigin: "50% 0%",
        force3D: true,
      });

      gsap.set(title, {
        "--gap": "0.16em",
        rotateX: -18,
        y: 8,
        filter: "blur(10px)",
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
        gsap.set(letters, {
          autoAlpha: 1,
          y: 0,
          x: 0,
          rotateX: 0,
          rotateY: 0,
          filter: "blur(0px)",
        });
        removed.forEach((el) => (el.style.display = "none"));
        gsap.set(root, { autoAlpha: 0, pointerEvents: "none" });
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
        .to({}, { duration: 0.45 })
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
        .to({}, { duration: 0.26 })
        .to(title, { y: -22, filter: "blur(6px)", duration: 0.55, ease: "power3.inOut" }, "+=0.02")
        .to(root, { scaleY: 0, duration: 1.05, ease: "power4.inOut" }, "<+=0.08")
        .to(root, { autoAlpha: 0, duration: 0.18, ease: "none" }, "<+=0.86");

      return tl;
    };

    let killed = false;
    let tl = null;

    const fontsReady = (() => {
      const f = document.fonts;
      if (!f || !f.load) return Promise.resolve();
      return Promise.allSettled([f.load('400 1em "VinaSans"'), f.ready]);
    })();

    fontsReady.then(() => {
      if (killed) return;
      tl = run();
    });

    return () => {
      killed = true;
      if (tl && typeof tl.kill === "function") tl.kill();
      unlockScroll();
    };
  }, []);

  return (
    <div ref={rootRef} className="loader">
      <div className="loader-title" aria-label="AWK">
        <span className="letter">A</span>
        <span className="letter">W</span>
        <span className="letter" data-remove="1">
          A
        </span>
        <span className="letter">K</span>
        <span className="letter" data-remove="1">
          E
        </span>
      </div>
    </div>
  );
}
