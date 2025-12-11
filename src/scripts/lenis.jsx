import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initLenis() {
  const lenis = new Lenis({
    duration: 1.3,
    smooth: true,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

  // Sync Lenis with GSAP
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // 🔥 CRUCIAL: conectar Lenis con ScrollTrigger
  lenis.on("scroll", ScrollTrigger.update);

  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      if (value !== undefined) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
  });

  ScrollTrigger.defaults({
    scroller: document.body,
  });

  return lenis;
}
