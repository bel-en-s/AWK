import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export default function LenisSmoothScroll() {
  useEffect(() => {
    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    // --- Reuse if already exists ---
    if (window.__LENIS__) {
      // Re-sync on mount (SPA cases)
      try {
        window.__LENIS__.resize?.();
        window.__LENIS__.scrollTo(window.scrollY || 0, { immediate: true });
      } catch (_) {}
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,        // ✅ mantenemos tu setup (no dependemos de GSAP ticker)
      smoothWheel: true,
      smoothTouch: false,
      duration: 1.1,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });

    window.__LENIS__ = lenis;

    // --- Bridge to ScrollTrigger (si existe) ---
    const onLenisScroll = () => {
      // update = mantener scrub/pins vivos
      window.ScrollTrigger?.update?.();
    };
    lenis.on("scroll", onLenisScroll);

    // --- Astro SPA: resync en cada navegación ---
    const hardResync = (opts = { toTop: false }) => {
      try {
        // 1) Lenis recalc (importante si cambió el DOM)
        lenis.resize?.();

        // 2) opcional: si tu Home siempre debe empezar arriba
        if (opts.toTop) {
          lenis.scrollTo(0, { immediate: true });
          window.scrollTo(0, 0);
        } else {
          // “kick” para que Lenis y el scroll nativo queden alineados
          const y = window.scrollY || 0;
          lenis.scrollTo(y, { immediate: true });
        }

        // 3) refresh de ScrollTrigger en frames (medición de pin)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.ScrollTrigger?.refresh?.(true);
          });
        });

        // fallback microtask
        setTimeout(() => window.ScrollTrigger?.refresh?.(true), 0);
      } catch (_) {}
    };

    const onBeforeSwap = () => {
      // si durante el swap estaba scrolleando, frenalo
      try {
        lenis.stop?.();
      } catch (_) {}
    };

    const onAfterSwap = () => {
      try {
        lenis.start?.();
      } catch (_) {}

      // ⚠️ Si querés que al volver a Home siempre arranque arriba:
      // hardResync({ toTop: true });

      // Si NO querés forzar arriba (más compatible con tu cuadrado):
      hardResync({ toTop: false });
    };

    document.addEventListener("astro:before-swap", onBeforeSwap);
    document.addEventListener("astro:after-swap", onAfterSwap);
    document.addEventListener("astro:page-load", onAfterSwap);

    // Primer sync
    hardResync({ toTop: false });

    return () => {
      document.removeEventListener("astro:before-swap", onBeforeSwap);
      document.removeEventListener("astro:after-swap", onAfterSwap);
      document.removeEventListener("astro:page-load", onAfterSwap);

      lenis.off("scroll", onLenisScroll);

      // ✅ Importante en SPA Astro:
      // NO destruir Lenis en cleanup, porque este componente puede unmount/mount
      // con los swaps y te quedás sin scroll.
      // Si realmente querés destruirlo, hacelo solo si sabés que se monta 1 vez global.
      // lenis.destroy();
      // window.__LENIS__ = null;
    };
  }, []);

  return null;
}
