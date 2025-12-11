import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Hero() {
  const titleRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 80 },
      { opacity: 1, y: 0, duration: 1.5, ease: "power4.out" }
    );
  }, []);

  return (
    <section className="hero">
      <h1 ref={titleRef}>AWK Motion Landing</h1>
    </section>
  );
}
