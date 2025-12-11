import { useEffect, useRef } from "react";

export default function Hero() {
  const titleRef = useRef(null);

  useEffect(() => {
    // Se asegura de que GSAP solo se cargue en el navegador
    async function loadGSAP() {
      const { gsap } = await import("gsap");

      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 80 },
        { opacity: 1, y: 0, duration: 1.5, ease: "power4.out" }
      );
    }

    loadGSAP();
  }, []);

  return (
    <section className="hero">
      <h1 ref={titleRef}>AWK Motion Landing</h1>
    </section>
  );
}
