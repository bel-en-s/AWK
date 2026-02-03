import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./InfiniteLogoMarquee.css";

const BG_MAP = { light: "#e9e8e3", dark: "#121212" };

export default function InfiniteLogoMarquee({
  src = `${import.meta.env.BASE_URL}images/tira.png`,
  alt = "Logo strip",
  height = "clamp(46px, 6vw, 76px)",
  bg = "light",
  speed = 90,
  gap = 56,
  direction = "left",
  fade = false,
  pauseOnHover = false,
  className = "",
}) {
  const rootRef = useRef(null);
  const viewportRef = useRef(null);
  const innerRef = useRef(null);
  const setARef = useRef(null);
  const setBRef = useRef(null);
  const imgProbeRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    const inner = innerRef.current;
    const setA = setARef.current;
    const setB = setBRef.current;
    const probe = imgProbeRef.current;

    if (!root || !viewport || !inner || !setA || !setB || !probe) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    let tween = null;
    let ro = null;
    let raf = 0;

    const wrapX = (x, w) => gsap.utils.wrap(-w, 0, x);

    const fillSet = (setEl, count) => {
      setEl.innerHTML = "";
      for (let i = 0; i < count; i++) {
        const tile = document.createElement("div");
        tile.className = "ilm__tile";
        tile.innerHTML = `<img class="ilm__img" src="${src}" alt="" draggable="false" />`;
        setEl.appendChild(tile);
      }
    };

    const rebuild = () => {
      const currentX = Number(gsap.getProperty(inner, "x")) || 0;

      tween?.kill();
      tween = null;

      const tileRect = probe.getBoundingClientRect();
      const tileW = Math.max(1, Math.round(tileRect.width));
      const viewW = Math.max(1, Math.round(viewport.clientWidth));

      const perTile = tileW + gap;
      const needed = Math.ceil((viewW + tileW * 2) / Math.max(1, perTile));

      fillSet(setA, needed);
      fillSet(setB, needed);

      const setW = Math.max(1, Math.round(setA.scrollWidth));

      gsap.set(setA, { x: 0 });
      gsap.set(setB, { x: setW });

      const startX = wrapX(currentX || gsap.utils.random(-setW, 0), setW);
      gsap.set(inner, { x: startX });

      const dir = direction === "right" ? 1 : -1;
      const pxps = Math.max(20, Number(speed) || 90);
      const duration = setW / pxps;

      tween = gsap.to(inner, {
        x: startX + dir * -setW,
        duration,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: (x) => `${wrapX(parseFloat(x), setW)}px`,
        },
      });
    };

    const scheduleRebuild = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(rebuild);
    };

    const onEnter = () => pauseOnHover && tween?.pause();
    const onLeave = () => pauseOnHover && tween?.resume();

    if (pauseOnHover) {
      root.addEventListener("pointerenter", onEnter);
      root.addEventListener("pointerleave", onLeave);
    }

    const start = () => {
      rebuild();
      ro = new ResizeObserver(scheduleRebuild);
      ro.observe(viewport);
    };

    const img = probe;
    if (!img.complete) img.addEventListener("load", start, { once: true });
    else start();

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      tween?.kill();
      if (pauseOnHover) {
        root.removeEventListener("pointerenter", onEnter);
        root.removeEventListener("pointerleave", onLeave);
      }
    };
  }, [src, speed, gap, direction, pauseOnHover, height]);

  const resolvedBg = BG_MAP[bg] ?? BG_MAP.light;

  return (
    <section
      ref={rootRef}
      className={`ilm ilm--${bg} ${fade ? "ilm--fade" : ""} ${className}`}
      style={{
        ["--ilm-h"]: height,
        ["--ilm-gap"]: `${Math.max(0, Number(gap) || 0)}px`,
        ["--ilm-bg"]: resolvedBg,
      }}
      aria-label="Infinite logos marquee"
    >
      <div ref={viewportRef} className="ilm__viewport">
        <img
          ref={imgProbeRef}
          className="ilm__probe"
          src={src}
          alt=""
          draggable="false"
        />

        <div ref={innerRef} className="ilm__inner" aria-label={alt}>
          <div ref={setARef} className="ilm__set" aria-hidden="true" />
          <div ref={setBRef} className="ilm__set" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
