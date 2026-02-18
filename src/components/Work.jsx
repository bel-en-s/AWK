// src/pages/Work/Work.jsx
import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import "./Work.css";

const withBase = (p) =>
  `${import.meta.env.BASE_URL}${String(p || "").replace(/^\/+/, "")}`;

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

export default function Work({ projects = PROJECTS }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  const previewRef = useRef(null);
  const previewImgRef = useRef(null);

  const itemRefs = useRef([]);
  const activeIndexRef = useRef(-1);

  const data = useMemo(() => {
    const arr = projects?.length ? projects : PROJECTS;
    return [...arr, ...arr, ...arr];
  }, [projects]);

  useLayoutEffect(() => {
    // =============================
    // NAV THEME FOR THIS PAGE
    // =============================
    // Blanco (texto/blordes blancos) => is-nav-blue
    // Azul (si lo quisieras distinto) => cambiá la clase
    const NAV_THEME = "is-nav-blue"; // <-- cambiar a "is-hero-blue" si preferís esa variante

    document.documentElement.classList.add(NAV_THEME);
    return () => document.documentElement.classList.remove(NAV_THEME);
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const preview = previewRef.current;
    const previewImg = previewImgRef.current;

    if (!viewport || !track || !preview || !previewImg) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    let raf = 0;

    let current = 0;
    let target = 0;

    let totalH = 1;
    let stepPx = 90;

    let snapTimer = 0;
    let snapTween = null;

    let touching = false;
    let lastY = 0;

    const setY = gsap.quickSetter(track, "y", "px");
    const wrap = (v) => gsap.utils.wrap(-totalH, 0, v);

    const measure = () => {
      const h = track.scrollHeight || 1;
      totalH = h / 3;

      const a = itemRefs.current[0];
      const b = itemRefs.current[1];
      if (a && b) {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const d = Math.abs((rb.top + rb.height / 2) - (ra.top + ra.height / 2));
        if (d > 10) stepPx = d;
      }
    };

    const pxToIndex = (px) => -px / stepPx;
    const indexToPx = (index) => -index * stepPx;

    const setActive = (idx) => {
      if (idx === activeIndexRef.current) return;
      activeIndexRef.current = idx;

      const project = data[idx];
      if (!project) return;

      // Active clear, others subtle blur
      if (!prefersReduced) {
        itemRefs.current.forEach((el, i) => {
          if (!el) return;
          const isActive = i === idx;

          gsap.to(el, {
            duration: 0.28,
            ease: "power2.out",
            overwrite: "auto",
            opacity: isActive ? 0.98 : 0.55,
            filter: isActive ? "blur(0px)" : "blur(2px)",
            scale: isActive ? 1 : 0.995,
          });
        });
      }

      // Preview crossfade
      const nextSrc = withBase(project.image);
      if (previewImg.getAttribute("data-src") === nextSrc) return;
      previewImg.setAttribute("data-src", nextSrc);

      if (prefersReduced) {
        previewImg.src = nextSrc;
        preview.classList.add("is-ready");
        return;
      }

      gsap.killTweensOf(previewImg);

      gsap.to(previewImg, {
        autoAlpha: 0,
        scale: 1.02,
        duration: 0.2,
        ease: "power2.out",
        overwrite: "auto",
        onComplete: () => {
          previewImg.src = nextSrc;
          preview.classList.add("is-ready");

          const onLoad = () => {
            previewImg.removeEventListener("load", onLoad);
            gsap.to(previewImg, {
              autoAlpha: 1,
              scale: 1,
              duration: 0.42,
              ease: "power2.out",
              overwrite: "auto",
            });
          };
          previewImg.addEventListener("load", onLoad, { once: true });
        },
      });
    };

    const pickClosestToCenter = () => {
      const centerY =
        viewport.getBoundingClientRect().top + viewport.clientHeight / 2;

      let best = -1;
      let bestDist = Infinity;

      const els = itemRefs.current;
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const d = Math.abs(mid - centerY);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      if (best !== -1) setActive(best);
    };

    const snapToNearest = () => {
      const idx = Math.round(pxToIndex(target));
      const snapped = indexToPx(idx);

      snapTween?.kill();
      snapTween = gsap.to(
        { v: target },
        {
          v: snapped,
          duration: 0.18,
          ease: "expo.out",
          onUpdate() {
            target = this.targets()[0].v;
          },
          onComplete() {
            target = snapped;
            snapTween = null;
          },
        }
      );
    };

    const scheduleSnap = () => {
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(() => {
        if (!touching) snapToNearest();
      }, 70);
    };

    let frames = 0;
    const tick = () => {
      current = gsap.utils.interpolate(current, target, 0.14);
      setY(wrap(current));

      frames++;
      if (frames % 2 === 0) pickClosestToCenter();

      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      measure();

      current = 0;
      target = 0;
      setY(0);

      if (!prefersReduced) {
        gsap.set(previewImg, { autoAlpha: 0, scale: 1.02 });
        itemRefs.current.forEach((el) => {
          if (!el) return;
          gsap.set(el, { opacity: 0.55, filter: "blur(2px)", scale: 0.995 });
        });
      }

      raf = requestAnimationFrame(tick);
      requestAnimationFrame(() => pickClosestToCenter());
    };

    start();

    // Desktop wheel: step + snap
    const onWheel = (e) => {
      e.preventDefault();

      const dir = e.deltaY > 0 ? 1 : -1;
      const intensity = Math.min(3, Math.max(1, Math.round(Math.abs(e.deltaY) / 90)));
      const steps = dir * intensity;

      snapTween?.kill();
      snapTween = null;

      target += -steps * stepPx;
      scheduleSnap();
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });

    // Mobile drag + snap on release
    const onTouchStart = (e) => {
      touching = true;
      lastY = e.touches[0].clientY;

      snapTween?.kill();
      snapTween = null;
      window.clearTimeout(snapTimer);
    };

    const onTouchMove = (e) => {
      if (!touching) return;

      const y = e.touches[0].clientY;
      const dy = y - lastY;
      lastY = y;

      target += dy * 1.15;
      e.preventDefault();
    };

    const onTouchEnd = () => {
      touching = false;
      snapToNearest();
    };

    viewport.addEventListener("touchstart", onTouchStart, { passive: true });
    viewport.addEventListener("touchmove", onTouchMove, { passive: false });
    viewport.addEventListener("touchend", onTouchEnd, { passive: true });

    const onResize = () => {
      measure();
      snapToNearest();
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(snapTimer);
      snapTween?.kill();
      gsap.killTweensOf(previewImg);

      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("touchstart", onTouchStart);
      viewport.removeEventListener("touchmove", onTouchMove);
      viewport.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
    };
  }, [data]);

  return (
    <main className="workPage">
      <div ref={previewRef} className="workPreview" aria-hidden="true">
        <img ref={previewImgRef} className="workPreviewImg" alt="" />
        <div className="workPreviewVignette" />
      </div>

      <section ref={viewportRef} className="workLoop" aria-label="Work loop">
        <div className="workFadeTop" aria-hidden="true" />
        <div className="workFadeBottom" aria-hidden="true" />

        <ul ref={trackRef} className="workLoopTrack">
          {data.map((p, i) => (
            <li key={i} className="workLoopItem">
              <h3
                className="workLoopTitle"
                ref={(el) => (itemRefs.current[i] = el)}
              >
                {p.title}
              </h3>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
