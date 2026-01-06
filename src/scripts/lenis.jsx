import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export default function LenisSmoothScroll() {
  useEffect(() => {
    // evita doble init
    if (window.__LENIS__) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      smoothTouch: false,
      duration: 1.1,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });

    window.__LENIS__ = lenis;

    return () => {
      lenis.destroy();
      window.__LENIS__ = null;
    };
  }, []);

  return null;
}
