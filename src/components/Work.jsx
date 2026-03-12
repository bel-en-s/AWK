import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import "./Work.css";

const withBase = (p) =>
  `${import.meta.env.BASE_URL}${String(p || "").replace(/^\/+/, "")}`;

const PROJECTS = [
  { title: "EDDING", image: "images/portfolio/PORTADAS work_EDDING-06.png", link: "https://www.behance.net/gallery/193917203/Edding-144-La-linea-que-mas-importa" },
  { title: "MOTION CLINIC", image: "images/portfolio/PORTADAS work_MOTION CLINIC.png", link: "https://www.behance.net/gallery/240536097/Motion-Clinic-Creative-Code" },
  { title: "HUSQVARNA", image: "images/portfolio/PORTADAS work_HUSQVARNA.png", link: "https://www.behance.net/gallery/190744185/Husqvarna-One-of-a-Kind" },
  { title: "CRAFT", image: "images/portfolio/PORTADAS work_CRAFT.png", link: "https://www.behance.net/sebastianlinck" },
  { title: "UNICEF", image: "images/portfolio/PORTADAS work_UNICEF.png", link: "https://www.behance.net/gallery/213046593/UNICEF-Alimentos-Imposibles-IA" },
  { title: "MOTOGUZZI", image: "images/portfolio/PORTADAS work_MOTO GUZZI.png", link: "https://www.behance.net/gallery/193933655/MotoGuzzi-Catering" },
  { title: "LA SATURNALIA", image: "images/portfolio/PORTADAS work_LA SATURNALIA.png", link: "https://www.behance.net/sebastianlinck" },
  { title: "MISTER TRAPO", image: "images/portfolio/PORTADAS work_MISTER TRAPO.png", link: "https://www.behance.net/gallery/193912869/Mr-Trapo-Paso-A-Paso" },
  { title: "SOLVAY", image: "images/portfolio/PORTADAS work_SOVAY.png", link: "https://www.behance.net/gallery/241741629/Solvay" },
  { title: "THE HIVE", image: "images/portfolio/PORTADAS work_THE HIVE.png", link: "https://www.behance.net/sebastianlinck" },
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
    document.documentElement.classList.add("is-nav-blue");
    return () => document.documentElement.classList.remove("is-nav-blue");
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const preview = previewRef.current;
    const previewImg = previewImgRef.current;

    if (!viewport || !track || !preview || !previewImg) return;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    let raf = 0;
    let current = 0;
    let target = 0;
    let totalH = 1;
    let stepPx = 90;
    let snapTween = null;
    let idx = 0;
    let wheelAcc = 0;
    let wheelCooldown = 0;
    let touching = false;
    let lastY = 0;
    let touchAcc = 0;

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
      console.log("stepPx", stepPx); // debug
    };

    const pxToIndex = (px) => -px / stepPx;
    const indexToPx = (index) => -index * stepPx;

    const setActive = (i) => {
      if (i === activeIndexRef.current) return;
      activeIndexRef.current = i;

      const project = data[i];
      if (!project) return;

      if (!prefersReduced) {
        itemRefs.current.forEach((el, k) => {
          if (!el) return;
          const isActive = k === i;
          gsap.to(el, {
            duration: 0.28,
            ease: "power2.out",
            overwrite: "auto",
            opacity: isActive ? 0.98 : 0.55,
            filter: isActive ? "blur(0px)" : "blur(2px)",
            scale: isActive ? 1 : 0.995,
            onStart: () => { el.style.transform = "translateZ(0)"; }, // force repaint
          });
        });
      }

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
            gsap.to(previewImg, { autoAlpha: 1, scale: 1, duration: 0.42, ease: "power2.out", overwrite: "auto" });
          };
          previewImg.addEventListener("load", onLoad, { once: true });
        },
      });
    };

    const pickClosestToCenter = () => {
      const centerY = viewport.getBoundingClientRect().top + viewport.clientHeight / 2;
      let best = -1;
      let bestDist = Infinity;
      const els = itemRefs.current;
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const d = Math.abs(mid - centerY);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      if (best !== -1) setActive(best);
      console.log("activeIndex", activeIndexRef.current); // debug
    };

    const goToIndex = (nextIdx, { immediate = false } = {}) => {
      idx = nextIdx;
      const snapped = indexToPx(idx);
      snapTween?.kill();
      snapTween = null;

      if (immediate || prefersReduced) {
        target = snapped;
        return;
      }

      snapTween = gsap.to({ v: target }, {
        v: snapped,
        duration: 0.22,
        ease: "expo.out",
        onUpdate() { target = this.targets()[0].v; },
        onComplete() { target = snapped; snapTween = null; },
      });
    };

    const syncIndexFromTarget = () => { idx = Math.round(pxToIndex(target)); };

    const tick = () => {
      current = gsap.utils.interpolate(current, target, 0.14);
      setY(wrap(current));
      pickClosestToCenter();
      raf = requestAnimationFrame(tick);
    };

    const start = async () => {
      cancelAnimationFrame(raf);

      if (document.fonts) await document.fonts.ready; // ✅ espera fuentes

      measure();
      current = 0;
      target = 0;
      idx = 0;
      setY(0);

      if (!prefersReduced) {
        gsap.set(previewImg, { autoAlpha: 0, scale: 1.02 });
        itemRefs.current.forEach((el) => { if (el) gsap.set(el, { opacity: 0.55, filter: "blur(2px)", scale: 0.995 }); });
      }

      raf = requestAnimationFrame(tick);

      // delay doble frame para mobile
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          pickClosestToCenter();
          if (activeIndexRef.current === -1) setActive(1);
        });
      });
    };

    start();

    const TRACKPAD_THRESHOLD = 42;
    const COOLDOWN_MS = 90;

    const onWheel = (e) => {
      e.preventDefault();
      const mode = e.deltaMode || 0;
      const linePx = stepPx;
      const deltaPx = mode === 1 ? e.deltaY * linePx : mode === 2 ? e.deltaY * viewport.clientHeight : e.deltaY;
      const now = performance.now();
      if (now < wheelCooldown) return;
      wheelAcc += deltaPx;
      if (Math.abs(wheelAcc) >= TRACKPAD_THRESHOLD) {
        const dir = wheelAcc > 0 ? 1 : -1;
        const steps = Math.min(3, Math.max(1, Math.round(Math.abs(wheelAcc) / 120)));
        goToIndex(idx + dir * steps);
        wheelAcc = 0;
        wheelCooldown = now + COOLDOWN_MS;
      }
    };

    const TOUCH_THRESHOLD = () => Math.max(18, stepPx * 0.33);

    const onTouchStart = (e) => { touching = true; lastY = e.touches[0].clientY; touchAcc = 0; snapTween?.kill(); snapTween = null; };
    const onTouchMove = (e) => {
      if (!touching) return;
      const y = e.touches[0].clientY;
      const dy = y - lastY;
      lastY = y;
      touchAcc += dy;
      const th = TOUCH_THRESHOLD();
      if (Math.abs(touchAcc) >= th) { const dir = touchAcc < 0 ? 1 : -1; goToIndex(idx + dir * 1); touchAcc = 0; }
      e.preventDefault();
    };
    const onTouchEnd = () => { touching = false; touchAcc = 0; syncIndexFromTarget(); goToIndex(idx); };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("touchstart", onTouchStart, { passive: true });
    viewport.addEventListener("touchmove", onTouchMove, { passive: false });
    viewport.addEventListener("touchend", onTouchEnd, { passive: true });

    const onResize = () => { measure(); syncIndexFromTarget(); goToIndex(idx, { immediate: true }); };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
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
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="workLoopTitle"
                ref={(el) => (itemRefs.current[i] = el)}
              >
                {p.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}