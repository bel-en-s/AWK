import { useLayoutEffect, useRef } from "react";
import "./InfiniteLogoMarquee.css";

const BG_MAP = { light: "transparent", dark: "#121212" };

export default function InfiniteLogoMarquee({
  src = `${import.meta.env.BASE_URL}images/tira_2.png`,
  alt = "Logo strip",
  height = "clamp(46px, 6vw, 76px)",
  bg = "light",
  speed = 10,
  gap = 56,
  direction = "left",
  fade = false,
  pauseOnHover = false,
  className = "",
  lightFilter = "brightness(0.15) contrast(1.15)",
}) {
  const rootRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!root || !viewport || !track) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    let rafId = 0;
    let last = performance.now();
    let x = 0;
    let singleWidth = 0;
    let paused = false;

    const cleanupClones = () => {
      track.querySelectorAll('[data-clone="true"]').forEach((n) => n.remove());
    };

    const computeWidth = (nodes) =>
      nodes.reduce((acc, n) => {
        const r = n.getBoundingClientRect();
        const cs = getComputedStyle(n);
        return (
          acc +
          Math.round(
            r.width +
              parseFloat(cs.marginLeft || 0) +
              parseFloat(cs.marginRight || 0)
          )
        );
      }, 0);

    const build = () => {
      cancelAnimationFrame(rafId);
      cleanupClones();

      const originals = [...track.querySelectorAll(".ilm__item")].filter(
        (n) => n.getAttribute("data-clone") !== "true"
      );

      if (!originals.length) return;

      singleWidth = computeWidth(originals);
      if (!singleWidth) return;

      const vw = viewport.clientWidth || window.innerWidth;
      const target = vw * 2 + singleWidth;

      let safety = 0;

      while (track.scrollWidth < target && safety++ < 80) {
        originals.forEach((s) => {
          const cl = s.cloneNode(true);
          cl.setAttribute("data-clone", "true");
          track.appendChild(cl);
        });
        track.getBoundingClientRect();
      }

      x = 0;
      track.style.transform = "translate3d(0px,0,0)";
      last = performance.now();

      step(last);
    };

    const dirSign = direction === "right" ? 1 : -1;

    const step = (now) => {
      rafId = requestAnimationFrame(step);
      if (paused) return;

      const dt = now - last;
      last = now;

      const duration = Math.max(5, Number(speed) || 40);
      const pxPerSec = singleWidth / duration;

      x += dirSign * pxPerSec * (dt / 1000);

      if (Math.abs(x) >= singleWidth) {
        x += x < 0 ? singleWidth : -singleWidth;
      }

      track.style.transform = `translate3d(${x}px,0,0)`;
    };

    const onEnter = () => {
      if (!pauseOnHover) return;
      paused = true;
    };

    const onLeave = () => {
      if (!pauseOnHover) return;
      paused = false;
      last = performance.now();
    };

    if (pauseOnHover) {
      root.addEventListener("pointerenter", onEnter);
      root.addEventListener("pointerleave", onLeave);
    }

    const img = track.querySelector("img");

    const start = () =>
      requestAnimationFrame(() => requestAnimationFrame(build));

    if (img) {
      if (img.decode) {
        img.decode().then(start).catch(start);
      } else if (!img.complete) {
        img.addEventListener("load", start, { once: true });
      } else {
        start();
      }
    } else {
      start();
    }

    let to = 0;

    const onResize = () => {
      clearTimeout(to);
      to = window.setTimeout(() => build(), 150);
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      if (pauseOnHover) {
        root.removeEventListener("pointerenter", onEnter);
        root.removeEventListener("pointerleave", onLeave);
      }
      cleanupClones();
    };
  }, [src, gap, speed, direction, pauseOnHover, height]);

  const resolvedBg = BG_MAP[bg] ?? BG_MAP.light;

  return (
    <section
      ref={rootRef}
      className={`ilm ilm--${bg} ${fade ? "ilm--fade" : ""} ${className}`}
      style={{
        ["--ilm-h"]: height,
        ["--ilm-gap"]: `${Math.max(0, Number(gap) || 0)}px`,
        ["--ilm-bg"]: resolvedBg,
        ["--ilm-light-filter"]: lightFilter,
      }}
      aria-label="Infinite logos marquee"
    >
      <div ref={viewportRef} className="ilm__viewport" aria-label={alt}>
        <div ref={trackRef} className="ilm__track">
          <div className="ilm__item">
            <img className="ilm__img" src={src} alt="" draggable="false" />
          </div>
          <div className="ilm__item">
            <img className="ilm__img" src={src} alt="" draggable="false" />
          </div>
        </div>
      </div>
    </section>
  );
}