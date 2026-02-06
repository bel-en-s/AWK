import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./Loader.css";

const HERO_BOOT_KEY = "AWK_HERO_BOOTED";
const AWK_NAV_KIND = "AWK_NAV_KIND";

function isHeroRoute() {
  if (typeof window === "undefined") return true;
  const p = (window.location.pathname || "/").replace(/\/+$/, "");
  return p === "" || p === "/" || p === "/AWK";
}

function navType() {
  try {
    const e = performance.getEntriesByType?.("navigation")?.[0];
    return e?.type || "navigate";
  } catch (_) {
    return "navigate";
  }
}

async function waitFonts(timeoutMs = 1200) {
  try {
    if (!document.fonts?.ready) return;
    await Promise.race([
      document.fonts.ready,
      new Promise((res) => setTimeout(res, timeoutMs)),
    ]);
  } catch (_) {}
}

export default function Loader({
  text = "AWAKE",
  minShowMs = 1200,
  introStagger = 0.06,
  introDuration = 0.55,
  deleteDelay = 0.10,
  deleteDuration = 0.22,
  joinDuration = 0.45,
  curtainDelay = 0.18,
  curtainDuration = 0.9,
  curtainEase = "expo.inOut",
  fadeOut = 0.12,
}) {
  const rootRef = useRef(null);
  const [done, setDone] = useState(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const html = document.documentElement;
    const body = document.body;

    const cleanupUnlock = () => {
      html.classList.remove("is-scroll-locked");
      body.classList.remove("is-scroll-locked");
      body.style.overflow = "";
      body.style.touchAction = "";
    };

    const finish = () => {
      gsap.set(root, { autoAlpha: 0, pointerEvents: "none" });
      cleanupUnlock();
      window.__AWK_LOADED__ = true;
      window.dispatchEvent(new CustomEvent("awk:loaded"));
      setDone(true);
    };

    const navKind = sessionStorage.getItem(AWK_NAV_KIND) || "hard";
    const alreadyBooted = !!sessionStorage.getItem(HERO_BOOT_KEY);
    const type = navType();
    const isReload = type === "reload";

    const shouldRun =
      isHeroRoute() &&
      navKind !== "spa" &&
      (isReload || !alreadyBooted);

    gsap.set(root, { autoAlpha: 1, pointerEvents: "all" });

    if (!shouldRun) {
      finish();
      return;
    }

    sessionStorage.setItem(HERO_BOOT_KEY, "1");
    sessionStorage.setItem(AWK_NAV_KIND, "hard");
    window.__AWK_LOADED__ = false;

    html.classList.add("is-scroll-locked");
    body.classList.add("is-scroll-locked");
    body.style.overflow = "hidden";
    body.style.touchAction = "none";

    const word = root.querySelector(".loader__word");
    const letters = Array.from(root.querySelectorAll(".loader__letter"));
    const curtain = root.querySelector(".loader__curtain");

    if (!word || !letters.length || !curtain) {
      finish();
      return;
    }

    const midA = letters[2];
    const lastE = letters[letters.length - 1];

    const keepA = letters[0];
    const keepW = letters[1];
    const keepK = letters[3];
    const keep = [keepA, keepW, keepK].filter(Boolean);
    const remove = [midA, lastE].filter(Boolean);

    const ctx = gsap.context(() => {
      gsap.set(word, { autoAlpha: 0 });
      gsap.set(curtain, { yPercent: 100, autoAlpha: 1 });

      gsap.set(letters, {
        autoAlpha: 0,
        yPercent: 90,
        rotateX: -55,
        transformPerspective: 900,
        transformOrigin: "50% 100%",
        filter: "blur(10px)",
        willChange: "transform, opacity, filter",
      });

      const startAt = performance.now();

      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: finish,
        onInterrupt: finish,
      });

      tl.add(() => {
        waitFonts(1400).then(() => gsap.set(word, { autoAlpha: 1 }));
      }, 0);

      tl.to(
        letters,
        {
          autoAlpha: 1,
          yPercent: 0,
          rotateX: 0,
          filter: "blur(0px)",
          duration: introDuration,
          stagger: { each: introStagger, from: "start" },
        },
        0.02
      );

      tl.add(() => {
        const elapsed = performance.now() - startAt;
        const remaining = Math.max(0, minShowMs - elapsed);
        if (remaining > 0) tl.to({}, { duration: remaining / 1000, ease: "none" });
      }, ">");

      tl.to(
        remove,
        {
          autoAlpha: 0,
          yPercent: -18,
          filter: "blur(12px)",
          duration: deleteDuration,
          ease: "power2.inOut",
        },
        `>+=${deleteDelay}`
      );

      tl.add(() => {
        if (keep.length !== 3) return;

        const first = keep.map((el) => el.getBoundingClientRect());

        remove.forEach((el) => {
          if (!el) return;
          el.style.display = "none";
        });

        void word.offsetWidth;

        const last = keep.map((el) => el.getBoundingClientRect());

        keep.forEach((el, i) => {
          const dx = first[i].left - last[i].left;
          const dy = first[i].top - last[i].top;
          gsap.set(el, { x: dx, y: dy });
        });

        gsap.to(keep, {
          x: 0,
          y: 0,
          duration: joinDuration,
          ease: "expo.inOut",
          overwrite: true,
        });
      }, ">-=0.02");

      tl.to({}, { duration: curtainDelay, ease: "none" }, ">");
      tl.to(curtain, { yPercent: 0, duration: curtainDuration, ease: curtainEase }, ">");
      tl.to(root, { autoAlpha: 0, duration: fadeOut, ease: "none" }, ">-=0.06");

      return () => tl.kill();
    }, root);

    return () => {
      ctx.revert();
      cleanupUnlock();
    };
  }, [
    text,
    minShowMs,
    introStagger,
    introDuration,
    deleteDelay,
    deleteDuration,
    joinDuration,
    curtainDelay,
    curtainDuration,
    curtainEase,
    fadeOut,
  ]);

  if (done) return null;

  return (
    <div ref={rootRef} className="loader" aria-label="Loading" role="status">
      <div className="loader__word" aria-hidden="true">
        {String(text)
          .toUpperCase()
          .split("")
          .map((ch, i) => (
            <span key={i} className="loader__letter">
              {ch}
            </span>
          ))}
      </div>

      <div className="loader__curtain" aria-hidden="true" />
    </div>
  );
}
