import { useEffect, useRef } from "react";
import "../styles/hero.css";

export default function Hero() {
  const titleRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    let gsap;

    const cursorImg = `${import.meta.env.BASE_URL}images/ojos.svg`;

    const SIZE = 140; // ⬅️ SVG más grande
    const LERP = 0.08; // ⬅️ movimiento más lento

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cursor = { x: mouse.x, y: mouse.y };

    const lerp = (a, b, n) => (1 - n) * a + n * b;

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    async function init() {
      const mod = await import("gsap");
      gsap = mod.gsap;

      // animación título
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 80 },
          { opacity: 1, y: 0, duration: 1.2, ease: "power4.out" }
        );
      }

      // cursor principal
      const main = document.createElement("img");
      main.src = cursorImg;
      main.className = "trail-cursor";
      main.style.width = `${SIZE}px`;
      main.style.height = `${SIZE}px`;
      document.body.appendChild(main);

      window.addEventListener("mousemove", handleMouseMove);

      const animate = () => {
        cursor.x = lerp(cursor.x, mouse.x, LERP);
        cursor.y = lerp(cursor.y, mouse.y, LERP);

        main.style.transform = `translate3d(${cursor.x - SIZE / 2}px, ${cursor.y - SIZE / 2}px, 0)`;

        // trail
        const clone = document.createElement("img");
        clone.src = cursorImg;
        clone.className = "trail-clone";
        clone.style.width = `${SIZE}px`;
        clone.style.height = `${SIZE}px`;
        clone.style.transform = main.style.transform;
        document.body.appendChild(clone);

        gsap.to(clone, {
          opacity: 0,
          filter: "blur(10px)", // ⬅️ solo blur
          duration: 1.8,        // ⬅️ dura más
          ease: "power2.out",
          onComplete: () => clone.remove(),
        });

        rafRef.current = requestAnimationFrame(animate);
      };

      animate();
    }

    init();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
      document.querySelectorAll(".trail-cursor, .trail-clone").forEach((el) => el.remove());
      gsap?.killTweensOf("*");
    };
  }, []);

  return (
    <section className="hero">
      <h1 ref={titleRef} className="hero-title">
      
      </h1>
    </section>
  );
}
