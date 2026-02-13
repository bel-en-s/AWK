import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import "./Work.css";

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
  const rootRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  const data = useMemo(() => {
    const arr = projects?.length ? projects : PROJECTS;
    return [...arr, ...arr, ...arr];
  }, [projects]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    // =============================
    // LOOP ENGINE
    // =============================

    let raf = 0;
    let current = 0;
    let target = 0;
    let totalH = 1;

    const setY = gsap.quickSetter(track, "y", "px");
    const wrap = (v) => gsap.utils.wrap(-totalH, 0, v);

    const measure = () => {
      const h = track.scrollHeight || 1;
      totalH = h / 3;
    };

    const tick = () => {
      current = gsap.utils.interpolate(current, target, 0.09);
      setY(wrap(current));
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      measure();
      current = 0;
      target = 0;
      setY(0);
      raf = requestAnimationFrame(tick);
    };

    start(); // ✅ SIEMPRE arranca

    // =============================
    // DESKTOP WHEEL
    // =============================

    const onWheel = (e) => {
      e.preventDefault();
      target -= e.deltaY * 0.9;
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });

    // =============================
    // MOBILE DRAG
    // =============================

    let touching = false;
    let lastY = 0;

    const onTouchStart = (e) => {
      touching = true;
      lastY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (!touching) return;

      const y = e.touches[0].clientY;
      const dy = y - lastY;
      lastY = y;

      target += dy * 1.25;

      // bloquea scroll nativo
      e.preventDefault();
    };

    const onTouchEnd = () => {
      touching = false;
    };

    viewport.addEventListener("touchstart", onTouchStart, { passive: true });
    viewport.addEventListener("touchmove", onTouchMove, { passive: false });
    viewport.addEventListener("touchend", onTouchEnd, { passive: true });

    // =============================
    // RESIZE
    // =============================

    const onResize = () => {
      measure();
      setY(wrap(current));
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);

      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("touchstart", onTouchStart);
      viewport.removeEventListener("touchmove", onTouchMove);
      viewport.removeEventListener("touchend", onTouchEnd);

      window.removeEventListener("resize", onResize);
    };
  }, [data]);

  return (
    <main ref={rootRef} className="workPage">
      <section ref={viewportRef} className="workLoop">
        <ul ref={trackRef} className="workLoopTrack">
          {data.map((p, i) => (
            <li key={i} className="workLoopItem">
              <h3 className="workLoopTitle">{p.title}</h3>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
