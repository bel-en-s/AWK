import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function LenisSmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    const isCoarse = window.matchMedia?.("(pointer: coarse)")?.matches;
    const isNarrow = window.matchMedia?.("(max-width: 920px)")?.matches;
    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua);

    // ✅ en mobile/iOS: scroll nativo (mucho más estable con pin)
    if (isCoarse || isNarrow || isIOS) return;

    // ✅ exposé para tu código
    window.ScrollTrigger = ScrollTrigger;

    if (window.__LENIS__) return;

    const lenis = new Lenis({
      smoothWheel: true,
      smoothTouch: false,
      duration: 1.05,
      wheelMultiplier: 1,
    });

    window.__LENIS__ = lenis;

    // ✅ integración pro: gsap ticker
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    lenis.on("scroll", () => ScrollTrigger.update());

    const onAfterSwap = () => {
      lenis.resize?.();
      requestAnimationFrame(() => ScrollTrigger.refresh(true));
    };

    document.addEventListener("astro:after-swap", onAfterSwap);
    document.addEventListener("astro:page-load", onAfterSwap);

    // primer refresh
    ScrollTrigger.refresh(true);

    return () => {
      document.removeEventListener("astro:after-swap", onAfterSwap);
      document.removeEventListener("astro:page-load", onAfterSwap);
      gsap.ticker.remove(raf);
      // no destroy en SPA
    };
  }, []);

  return null;
}
