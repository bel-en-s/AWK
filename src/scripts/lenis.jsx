import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let _lenis = null;

export function initLenis() {
  if (_lenis) return _lenis;

  const lenis = new Lenis({
    // más suave = más duración
    duration: 1.9,

    // wheel
    smoothWheel: true,
    wheelMultiplier: 0.85,

    // touch
    smoothTouch: false,
    touchMultiplier: 1.0,

    // easing más “cremosa”
    easing: (t) => 1 - Math.pow(1 - t, 4),
  });

  // RAF con GSAP ticker (más estable con GSAP + ScrollTrigger)
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // sync con ScrollTrigger
  lenis.on("scroll", ScrollTrigger.update);

  // refresh al cargar (y cuando pinnea cosas)
  ScrollTrigger.addEventListener("refresh", () => lenis.resize());
  ScrollTrigger.refresh();

  _lenis = lenis;
  window.lenis = lenis; // debug opcional
  return lenis;
}
