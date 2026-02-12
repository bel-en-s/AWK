// Work.jsx
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import "./Work.css";

/**
 * Reemplazá los image paths por los reales de cada proyecto si querés.
 */
const PROJECTS = [
  { title: "EDDING", image: "images/portfolio/PORTADAS-01.jpg" },
  { title: "MOTION CLINIC", image: "images/portfolio/PORTADAS-02.jpg" },
  { title: "HUSQVARNA", image: "images/portfolio/PORTADAS-03.jpg" },
  { title: "CRAFT", image: "images/portfolio/PORTADAS-04.jpg" },
  { title: "UNICEF", image: "images/portfolio/PORTADAS-05.jpg" },
  { title: "VESPA", image: "images/portfolio/PORTADAS-06.jpg" },
  { title: "MOTOGUZZI", image: "images/portfolio/PORTADAS-07.jpg" },
  { title: "LA SATURNALIA", image: "images/portfolio/PORTADAS-08.jpg" },
  { title: "SIERRA DE LOS PADRES", image: "images/portfolio/PORTADAS-09.jpg" },
  { title: "MISTER TRAPO", image: "images/portfolio/PORTADAS-10.jpg" },
  { title: "FUNDACION PADRES", image: "images/portfolio/PORTADAS-11.jpg" },
  { title: "SOLVAY", image: "images/portfolio/PORTADAS-12.jpg" },
  { title: "NATURA AGD", image: "images/portfolio/PORTADAS-13.jpg" },
  { title: "THE HIVE", image: "images/portfolio/PORTADAS-14.jpg" },
  { title: "ROWER", image: "images/portfolio/PORTADAS-15.jpg" },
  { title: "SEMANA DEL DESCANSO", image: "images/portfolio/PORTADAS-16.jpg" },
];

const withBase = (p) => {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "") + "/";
  const clean = String(p || "").replace(/^\/+/, "");
  return (base + clean).replace(/\/{2,}/g, "/");
};

function whenAwkLoaded(cb) {
  if (typeof window === "undefined") return () => {};
  if (window.__AWK_LOADED__ === true) {
    cb();
    return () => {};
  }
  const on = () => cb();
  window.addEventListener("awk:loaded", on, { once: true });
  return () => window.removeEventListener("awk:loaded", on);
}

export default function Work({ projects = PROJECTS }) {
  const rootRef = useRef(null);
  const loopViewportRef = useRef(null);
  const loopTrackRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("is-nav-blue");
    return () => html.classList.remove("is-nav-blue");
  }, []);

  const data = useMemo(() => {
    const arr = Array.isArray(projects) && projects.length ? projects : PROJECTS;
    return arr.map((p, idx) => ({
      ...p,
      _idx: idx + 1,
      image:
        String(p.image || "").startsWith("http") || !p.image
          ? String(p.image || "")
          : withBase(p.image),
    }));
  }, [projects]);

  const loopData = useMemo(() => [...data, ...data, ...data], [data]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const viewport = loopViewportRef.current;
    const track = loopTrackRef.current;
    const img = previewRef.current;
    if (!root || !viewport || !track || !img) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const canHover =
      window.matchMedia?.("(hover: hover)")?.matches &&
      window.matchMedia?.("(pointer: fine)")?.matches;

    // ---------- Hover preview (lejos del cursor + clamp) ----------
    gsap.set(img, { xPercent: -50, yPercent: -50, autoAlpha: 0 });

    let cleanupHover = () => {};
    if (canHover && !prefersReduced) {
      let firstEnter = false;

      const setX = gsap.quickTo(img, "x", { duration: 0.35, ease: "power3" });
      const setY = gsap.quickTo(img, "y", { duration: 0.35, ease: "power3" });

      // distancia del cursor (ajustá a gusto)
      const OFFSET_X = 440; // derecha
      const OFFSET_Y = 240; // abajo (más “borde inferior”)

      const clampPos = (x, y) => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const r = img.getBoundingClientRect();
        const halfW = r.width / 2;
        const halfH = r.height / 2;

        const cx = gsap.utils.clamp(halfW + 12, vw - halfW - 12, x);
        const cy = gsap.utils.clamp(halfH + 12, vh - halfH - 12, y);
        return { x: cx, y: cy };
      };

      const align = (e) => {
        const rawX = e.clientX + OFFSET_X;
        const rawY = e.clientY + OFFSET_Y;

        const { x, y } = clampPos(rawX, rawY);

        if (firstEnter) {
          setX(x, x);
          setY(y, y);
          firstEnter = false;
        } else {
          setX(x);
          setY(y);
        }
      };

      const startFollow = () => document.addEventListener("mousemove", align);
      const stopFollow = () => document.removeEventListener("mousemove", align);

      const fade = gsap.to(img, {
        autoAlpha: 1,
        ease: "none",
        paused: true,
        duration: 0.12,
        onReverseComplete: stopFollow,
      });

      const items = Array.from(root.querySelectorAll("[data-work-item='true']"));

      const enter = (e) => {
        const el = e.currentTarget;
        const src = el.getAttribute("data-image");
        if (src && img.getAttribute("src") !== src) img.setAttribute("src", src);

        firstEnter = true;
        fade.play();
        startFollow();
        align(e);
      };

      const leave = () => fade.reverse();

      items.forEach((el) => {
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
      });

      cleanupHover = () => {
        stopFollow();
        fade.kill();
        items.forEach((el) => {
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("mouseleave", leave);
        });
        gsap.killTweensOf(img);
      };
    }

    // ---------- Infinite loop ----------
    let raf = 0;
    let current = 0;
    let target = 0;
    let totalH = 1;

    const setY = gsap.quickSetter(track, "y", "px");
    const wrap = (v) => gsap.utils.wrap(-totalH, 0, v);

    const measure = () => {
      const h = track.scrollHeight || track.getBoundingClientRect().height || 1;
      totalH = Math.max(1, h / 3);
    };

    const tick = () => {
      if (prefersReduced) {
        setY(0);
        return;
      }

      current = gsap.utils.interpolate(current, target, 0.09);
      const y = wrap(current);
      setY(y);

      if (current < -totalH) {
        current += totalH;
        target += totalH;
      } else if (current > 0) {
        current -= totalH;
        target -= totalH;
      }

      raf = requestAnimationFrame(tick);
    };

    const onWheel = (e) => {
      e.preventDefault();
      target -= (e.deltaY || 0) * 0.85;
    };

    const onResize = () => {
      measure();
      current = wrap(current);
      target = current;
      setY(current);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      measure();
      current = 0;
      target = 0;
      setY(0);
      raf = requestAnimationFrame(tick);
    };

    const offLoaded = whenAwkLoaded(start);

    viewport.addEventListener("wheel", onWheel, { passive: false });

    // touch drag
    let touching = false;
    let lastY = 0;

    const onTouchStart = (e) => {
      touching = true;
      lastY = e.touches?.[0]?.clientY ?? 0;
    };

    const onTouchMove = (e) => {
      if (!touching) return;
      const y = e.touches?.[0]?.clientY ?? lastY;
      const dy = y - lastY;
      lastY = y;
      target += dy * 1.2;
      e.preventDefault();
    };

    const onTouchEnd = () => {
      touching = false;
    };

    viewport.addEventListener("touchstart", onTouchStart, { passive: true });
    viewport.addEventListener("touchmove", onTouchMove, { passive: false });
    viewport.addEventListener("touchend", onTouchEnd, { passive: true });

    window.addEventListener("resize", onResize);

    const onSwap = () => start();
    document.addEventListener("astro:after-swap", onSwap);

    // ---------- Active center item (ACTIVE = BLUR) ----------
    let activeRaf = 0;

    const updateActive = () => {
      const items = Array.from(root.querySelectorAll(".workLoopItem"));
      if (!items.length) {
        activeRaf = requestAnimationFrame(updateActive);
        return;
      }

      const viewportRect = viewport.getBoundingClientRect();
      const centerY = viewportRect.top + viewportRect.height / 2;

      let closest = null;
      let closestDist = Infinity;

      for (const el of items) {
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const dist = Math.abs(centerY - elCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closest = el;
        }
      }

      for (const el of items) {
        el.classList.toggle("is-active", el === closest);
      }

      activeRaf = requestAnimationFrame(updateActive);
    };

    updateActive();

    return () => {
      offLoaded?.();
      document.removeEventListener("astro:after-swap", onSwap);

      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("touchstart", onTouchStart);
      viewport.removeEventListener("touchmove", onTouchMove);
      viewport.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);

      cancelAnimationFrame(raf);
      cancelAnimationFrame(activeRaf);

      cleanupHover?.();
      gsap.killTweensOf(track);
    };
  }, [loopData]);

  return (
    <main ref={rootRef} className="workPage workPage--loop" aria-label="Work">
      <img ref={previewRef} className="workPreview" alt="" />
      <section ref={loopViewportRef} className="workLoop" aria-label="Projects loop">
        <ul ref={loopTrackRef} className="workLoopTrack" role="list" aria-label="Projects">
          {loopData.map((p, i) => (
            <li
              key={`${p.title}-${p._idx}-${i}`}
              className="workLoopItem"
              data-work-item="true"
              data-image={p.image}
            >
              <h3 className="workLoopTitle">{p.title}</h3>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
