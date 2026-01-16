// Hero.jsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import CursorLanding from "./global/CursorLanding";
import Services from "./Services";
import "./Hero.css";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {

  const [showCursor, setShowCursor] = useState(false);
  const [showNav, setShowNav] = useState(false);

  // "bootReady" = ya setee presets iniciales (evita micro-flicker)
  const [bootReady, setBootReady] = useState(false);

  // "unlockScroll" = cuando termina intro + triggers listos
  const [unlockScroll, setUnlockScroll] = useState(false);

  useEffect(() => {
    console.log("HERO MOUNT");
    return () => {
      console.log("HERO UNMOUNT");
    };
  }, []);
  

  // =========================
  // Refs
  // =========================
  const heroRef = useRef(null);
  const cursorWrapRef = useRef(null);
  const titleRef = useRef(null);

  const copyBgRef = useRef(null);
  const copyCardRef = useRef(null);

  const midRef = useRef(null);
  const talkRef = useRef(null);

  // =========================
  // Constants
  // =========================
  const TYPE_TEXT = useMemo(() => "Creative digital experiences", []);

  // =========================
  // Helpers
  // =========================
  const lockScroll = (locked) => {
    const lenis = window.__LENIS__;
    const html = document.documentElement;
    const body = document.body;
  
    if (locked) {
      html.classList.add("is-scroll-locked");
      body.classList.add("is-scroll-locked");
      body.style.overflow = "hidden";
      body.style.touchAction = "none";
  
      // clave: pausá Lenis (no fixes el body)
      lenis?.stop?.();
  
      // mantené arriba si tu hero lo necesita
      lenis?.scrollTo?.(0, { immediate: true });
      window.scrollTo(0, 0);
      return;
    }
  
    html.classList.remove("is-scroll-locked");
    body.classList.remove("is-scroll-locked");
    body.style.overflow = "";
    body.style.touchAction = "";
  
    lenis?.start?.();
  };
  


  const waitForLayoutStability = async (rootEl, timeoutMs = 1200) => {
    // Espera fonts + imágenes del hero (pero con timeout)
    const waitFonts = async () => {
      try {
        if (document.fonts?.ready) await document.fonts.ready;
      } catch (_) {}
    };

    const waitImages = async () => {
      try {
        const imgs = Array.from(rootEl.querySelectorAll("img"));
        if (!imgs.length) return;

        await Promise.all(
          imgs.map(
            (img) =>
              new Promise((res) => {
                if (img.complete) return res();
                const done = () => res();
                img.addEventListener("load", done, { once: true });
                img.addEventListener("error", done, { once: true });
              })
          )
        );
      } catch (_) {}
    };

    const withTimeout = (p) =>
      Promise.race([p, new Promise((res) => setTimeout(res, timeoutMs))]);

    await withTimeout(Promise.all([waitFonts(), waitImages()]));
  };



  // =========================
  // Astro SPA: entrar desde otra página
  // - forzar scroll top
  // - matar triggers viejos (pins colgados)
  // - refresh fuerte al page-load
  // =========================
  useLayoutEffect(() => {
    const killAllTriggers = () => {
      try {
        ScrollTrigger.getAll().forEach((t) => t.kill(true));
        ScrollTrigger.clearScrollMemory?.();
      } catch (_) {}
    };

    const onPageLoad = () => {
      // Astro a veces preserva scroll al navegar
      // Para un hero que depende del pin, conviene arrancar arriba.
      window.scrollTo(0, 0);

      // Refresh en frames para que mida bien después del swap
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh(true);
        });
      });
      setTimeout(() => ScrollTrigger.refresh(true), 0);
    };

    document.addEventListener("astro:before-swap", killAllTriggers);
    document.addEventListener("astro:page-load", onPageLoad);
    document.addEventListener("astro:after-swap", onPageLoad);

    return () => {
      document.removeEventListener("astro:before-swap", killAllTriggers);
      document.removeEventListener("astro:page-load", onPageLoad);
      document.removeEventListener("astro:after-swap", onPageLoad);
    };
  }, []);

  // =========================
  // Hover helper (nav-hover)
  // =========================
  useEffect(() => {
    if (!showCursor) return;

    const el = copyCardRef.current;
    if (!el) return;

    const cls = "nav-hover";
    const onEnter = () => document.documentElement.classList.add(cls);
    const onLeave = () => document.documentElement.classList.remove(cls);

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("focus", onEnter);
    el.addEventListener("blur", onLeave);

    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("focus", onEnter);
      el.removeEventListener("blur", onLeave);
      document.documentElement.classList.remove(cls);
    };
  }, [showCursor]);

  // =========================
  // BOOT PRESET (evita FOUC del rect negro)
  // - corre apenas existe el DOM del hero (aunque cursor no esté)
  // - setea EXACTO el estado inicial del rect, sin esperar scroll/intro
  // =========================

  useEffect(() => {
  const onLoaded = () => setShowCursor(true);

  if (window.__AWK_LOADED__) {
    setShowCursor(true);
    return;
  }

  window.addEventListener("awk:loaded", onLoaded);
  return () => window.removeEventListener("awk:loaded", onLoaded);
}, []);


  useLayoutEffect(() => {
    const heroEl = heroRef.current;
    const bg = copyBgRef.current;
    const card = copyCardRef.current;

    if (!heroEl || !bg || !card) return;

    // lock scroll desde el principio del mount (tu punto #1)
    lockScroll(true);
    setUnlockScroll(false);
  

    // setShowCursor(true);

    const RECT_H = 180;
    const RECT_PAD = 18;
    const rectWidth = () => Math.min(280, window.innerWidth - 20);

    // Seteo inmediato antes del primer paint "real"
    gsap.set(bg, {
      left: 10,
      bottom: 10,
      top: "auto",
      right: "auto",
      width: rectWidth,
      height: RECT_H,
      borderRadius: 0,
      backgroundColor: "#0b0b0b",
      border: "1px solid rgba(255,255,255,0.16)",
      boxShadow: "0 12px 34px rgba(0,0,0,0.22)",
      autoAlpha: 1,
    });

    gsap.set(card, {
      left: 10,
      bottom: 10,
      top: "auto",
      right: "auto",
      width: rectWidth,
      height: RECT_H,
      borderRadius: 0,
      backgroundColor: "transparent",
      color: "#fff",
      padding: RECT_PAD,
      boxShadow: "none",
      autoAlpha: 1,
    });

    // Flag para CSS (si querés)
    heroEl.dataset.ready = "true";
    setBootReady(true);

    // Si cambia el viewport, mantené el tamaño estable (sin refresh por ahora)
    const onResize = () => {
      gsap.set(bg, { width: rectWidth(), height: RECT_H });
      gsap.set(card, { width: rectWidth(), height: RECT_H, padding: RECT_PAD });
      ScrollTrigger.refresh(true);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // Intro animation (cursor + title + type + talk)
  // - cuando termina: desbloquea scroll (punto #1)
  // =========================
  useLayoutEffect(() => {
    if (!showCursor) return;

    setShowNav(false);

    const heroEl = heroRef.current;
    const wrap = cursorWrapRef.current;
    const title = titleRef.current;

    const bg = copyBgRef.current;
    const card = copyCardRef.current;

    const midEl = midRef.current;
    const talkEl = talkRef.current;

    if (!heroEl || !wrap || !title || !bg || !card || !midEl || !talkEl) return;

    const letters = title.querySelectorAll(".hero-title-letter");
    const typeLetters = midEl.querySelectorAll(".type-letter");
    const caret = midEl.querySelector(".type-caret");

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const ctx = gsap.context(() => {
      gsap.killTweensOf([wrap, letters, bg, card, talkEl, typeLetters, caret]);

      gsap.set(wrap, { autoAlpha: 0, scale: 0.9, y: 10, filter: "blur(10px)" });

      gsap.set(title, { autoAlpha: 1 });
      gsap.set(letters, {
        yPercent: -140,
        rotateX: -70,
        transformPerspective: 900,
        transformOrigin: "50% 50%",
        autoAlpha: 0,
        filter: "blur(10px)",
        force3D: true,
      });

      gsap.set(midEl, { autoAlpha: 1 });
      gsap.set(typeLetters, { autoAlpha: 0 });
      if (caret) gsap.set(caret, { autoAlpha: 0 });

      gsap.set(talkEl, { autoAlpha: 0, y: 6, filter: "blur(8px)" });

      if (prefersReduced) {
        gsap.set(wrap, { autoAlpha: 1, scale: 1, y: 0, filter: "blur(0px)" });
        gsap.set(letters, {
          yPercent: 0,
          rotateX: 0,
          autoAlpha: 1,
          filter: "blur(0px)",
        });
        gsap.set(typeLetters, { autoAlpha: 1 });
        if (caret) gsap.set(caret, { autoAlpha: 0 });
        gsap.set(talkEl, { autoAlpha: 1, y: 0, filter: "blur(0px)" });

        setShowNav(true);

        // desbloqueo inmediato
        setUnlockScroll(true);
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      tl.to(wrap, { autoAlpha: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 0.8 }, 0);

      tl.to(
        letters,
        {
          yPercent: 0,
          rotateX: 0,
          autoAlpha: 1,
          filter: "blur(0px)",
          duration: 1.05,
          stagger: { each: 0.06, from: "start" },
          ease: "expo.inOut",
        },
        0.05
      );

      tl.add(() => setShowNav(true), ">+=0.12");

      let caretTween = null;
      if (caret) {
        gsap.set(caret, { autoAlpha: 1 });
        caretTween = gsap.to(caret, {
          autoAlpha: 0,
          duration: 0.12,
          ease: "none",
          repeat: -1,
          yoyo: true,
          paused: true,
        });
        tl.add(() => caretTween?.play(), "<");
      }

      tl.to(typeLetters, { autoAlpha: 1, duration: 0.0001, stagger: 0.03, ease: "none" }, ">-0.05");

      if (caret) {
        tl.add(() => {
          caretTween?.pause(0);
          caretTween?.kill();
          caretTween = null;
        }, ">");
        tl.to(caret, { autoAlpha: 0, duration: 0.18, ease: "none" }, ">-0.02");
      }

      tl.to(talkEl, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "expo.out" }, ">-0.05");

      // ✅ al final del intro: desbloquea scroll
      tl.add(() => setUnlockScroll(true), ">+=0.02");

      return () => tl.kill();
    }, heroEl);

    return () => ctx.revert();
  }, [showCursor]);

  // =========================
  // Scroll lock effect (state-driven)
  // =========================
  useEffect(() => {
    // si todavía no arrancó el boot, bloqueamos igual
    const shouldLock = !unlockScroll;
    lockScroll(shouldLock);

    return () => {
      // al desmontar, asegurá desbloqueo
      lockScroll(false);
    };
  }, [unlockScroll]);

  // =========================
  // Wiggle CTA
  // =========================
  useLayoutEffect(() => {
    const el = talkRef.current;
    if (!el) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const ctx = gsap.context(() => {
      gsap.set(el, {
        rotateZ: -8,
        transformOrigin: "50% 50%",
        willChange: "transform",
        force3D: true,
      });

      let wiggle = null;

      const enter = () => {
        if (prefersReduced) return;

        gsap.to(el, { rotateZ: 6, duration: 0.32, ease: "expo.out", overwrite: "auto" });

        wiggle?.kill();
        wiggle = gsap.to(el, {
          rotateZ: -6,
          duration: 0.75,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          overwrite: "auto",
        });
      };

      const leave = () => {
        if (prefersReduced) return;

        wiggle?.kill();
        wiggle = null;

        gsap.to(el, { rotateZ: -8, duration: 0.55, ease: "expo.out", overwrite: "auto" });
      };

      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);

      return () => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
        wiggle?.kill();
      };
    });

    return () => ctx.revert();
  }, []);

  // =========================
  // Hero -> Services (ScrollTrigger)
  // - espera layout estable
  // - mata triggers viejos del hero
  // - refresh fuerte (fix #2)
  // =========================
  useLayoutEffect(() => {
    if (!showCursor) return;
    if (!bootReady) return;
    if (!unlockScroll) return;
    

    const heroEl = heroRef.current;
    const bg = copyBgRef.current;
    const card = copyCardRef.current;
    const title = titleRef.current;
    const midEl = midRef.current;
    const talkEl = talkRef.current;

    if (!heroEl || !bg || !card || !title || !midEl || !talkEl) return;

    let killed = false;

    const run = async () => {
      // 1) asegurá scrollTop=0 cuando entrás por nav
      // (si no, el pin empieza en un lugar raro)
      window.scrollTo(0, 0);

      // 2) espera estabilidad (fonts/images)
      await waitForLayoutStability(heroEl, 1200);
      if (killed) return;

      // 3) mata triggers previos SOLO del hero (por las dudas)
      ScrollTrigger.getAll()
        .filter((t) => t?.vars?.trigger === heroEl || t?.vars?.id === "HERO_SERVICES")
        .forEach((t) => t.kill(true));

      const ctx = gsap.context(() => {
        const svc = heroEl.querySelector(".svc");
        const svcIntroCard = heroEl.querySelector(".svc-introCard");
        const svcTrack = heroEl.querySelector(".svc-track");
        const svcRow = heroEl.querySelector(".svc-row");

        if (!svc || !svcIntroCard || !svcTrack || !svcRow) return;

        const prefersReduced =
          window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

        const getDist = () => Math.max(0, svcRow.scrollWidth - svcTrack.clientWidth);

        const RECT_H = 180;
        const RECT_PAD = 18;
        const rectWidth = () => Math.min(280, window.innerWidth - 20);

        const resetForMeasure = () => {
          gsap.set([bg, card], { clearProps: "top,right,width,height,transform" });

          gsap.set(bg, {
            left: 10,
            bottom: 10,
            top: "auto",
            right: "auto",
            width: rectWidth,
            height: RECT_H,
            borderRadius: 0,
            backgroundColor: "#0b0b0b",
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: "0 12px 34px rgba(0,0,0,0.22)",
            autoAlpha: 1,
          });

          gsap.set(card, {
            left: 10,
            bottom: 10,
            top: "auto",
            right: "auto",
            width: rectWidth,
            height: RECT_H,
            borderRadius: 0,
            backgroundColor: "transparent",
            color: "#fff",
            padding: RECT_PAD,
            boxShadow: "none",
            autoAlpha: 1,
          });
        };

        const measure = () => {
          resetForMeasure();

          const heroR = heroEl.getBoundingClientRect();
          const to = svcIntroCard.getBoundingClientRect();

          return {
            heroLeft: heroR.left,
            heroTop: heroR.top,
            toLeft: to.left,
            toTop: to.top,
            toW: to.width,
            toH: to.height,
          };
        };

        gsap.set(svc, { autoAlpha: 0, pointerEvents: "none" });
        gsap.set(svcRow, { x: 0 });
        gsap.set(svcIntroCard, { autoAlpha: 0 });

        if (prefersReduced) {
          ScrollTrigger.create({
            id: "HERO_SERVICES_FALLBACK",
            trigger: heroEl,
            start: "top top",
            end: () => `+=${window.innerHeight + getDist()}`,
          });
          return;
        }

        const onRefreshInit = () => {
          resetForMeasure();
          gsap.set(svcRow, { x: 0 });
        };
        ScrollTrigger.addEventListener("refreshInit", onRefreshInit);

        const syncEyes = (inServices) => {
          window.dispatchEvent(
            new CustomEvent("awk:eyes", {
              detail: { show: !inServices },
            })
          );
        };

        const tl = gsap.timeline({
          scrollTrigger: {
            id: "HERO_SERVICES",
            trigger: heroEl,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * 1.25 + getDist())}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,

            // ojos off en services
            onUpdate: (self) => {
              const inServices = self.progress > 0.32;
              if (self._eyesInServices !== inServices) {
                self._eyesInServices = inServices;
                syncEyes(inServices);
              }
            },
            onRefresh: (self) => {
              const inServices = self.progress > 0.32;
              self._eyesInServices = inServices;
              syncEyes(inServices);
            },
          },
        });

        tl.set({}, {}, 0);
        resetForMeasure();

        // 1) BG expands fullscreen
        tl.to(
          bg,
          {
            left: 0,
            bottom: 0,
            top: 0,
            right: 0,
            width: () => window.innerWidth,
            height: () => window.innerHeight,
            borderRadius: 0,
            border: "0px solid rgba(255,255,255,0)",
            boxShadow: "none",
            ease: "none",
            duration: 0.52,
          },
          0
        );

        // 2) hide hero UI
        tl.to([title, midEl, talkEl], { autoAlpha: 0, filter: "blur(10px)", duration: 0.18, ease: "none" }, 0.22);

        // 3) bg to blue
        tl.to(bg, { backgroundColor: "var(--svc-blue, #0A25FF)", duration: 0.18, ease: "none" }, 0.30);

        // 4) services on
        tl.to(svc, { autoAlpha: 1, duration: 0.12, ease: "none" }, 0.40);
        tl.set(svc, { pointerEvents: "auto" }, 0.42);

        // 5) card morph to intro slot
        tl.to(
          card,
          {
            left: () => Math.round(measure().toLeft - measure().heroLeft),
            top: () => Math.round(measure().toTop - measure().heroTop),
            bottom: "auto",
            right: "auto",
            width: () => Math.round(measure().toW),
            height: () => Math.round(measure().toH),

            backgroundColor: "#fff",
            color: "#000",
            padding: "24px",
            borderRadius: "22px",
            boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
            ease: "none",
            duration: 0.34,
          },
          0.18
        );

        // 6) horizontal scroll
        tl.to(svcRow, { x: () => -getDist(), ease: "none", duration: 0.48 }, 0.62);

        // refresh fuerte (fix navegación interna)
        requestAnimationFrame(() => ScrollTrigger.refresh(true));
        setTimeout(() => ScrollTrigger.refresh(true), 0);

        // re-refresh cuando algo cambie ancho (cards)
        const ro = new ResizeObserver(() => ScrollTrigger.refresh(true));
        ro.observe(svcRow);
        ro.observe(svcTrack);

        const onLoad = () => ScrollTrigger.refresh(true);
        window.addEventListener("load", onLoad);

        return () => {
          window.removeEventListener("load", onLoad);
          ro.disconnect();
          ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
          syncEyes(false);
          tl.scrollTrigger?.kill(true);
          tl.kill();
        };
      }, heroEl);

      // cleanup
      return () => ctx.revert();
    };

    let cleanup = null;
    run().then((fn) => {
      cleanup = fn;
    });

    return () => {
      killed = true;
      if (cleanup) cleanup();
    };
  }, [showCursor, bootReady, unlockScroll]);

  // =========================
  // Render
  // =========================
  return (
    <section
      ref={heroRef}
      className="hero hero--withServices"
      // data-ready evita FOUC si querés usarlo en CSS
      data-ready={bootReady ? "true" : "false"}
    >
      {/* Cursor overlay */}
      {showCursor && (
        <div ref={cursorWrapRef} className="cursor-landing-wrap" style={{ opacity: 0, visibility: "hidden" }}>
          <CursorLanding activeAreaRef={heroRef} />
        </div>
      )}

      {/* Title */}
      <div className="hero-content">
        <h1
          ref={titleRef}
          data-cursor="blue"
          className="hero-title"
          aria-label="AWAKE"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          {"AWAKE".split("").map((ch, i) => (
            <span key={i} className="hero-title-letter" aria-hidden="true">
              {ch}
            </span>
          ))}
        </h1>
      </div>

      {/* BG: rect negro que se expande */}
      <div ref={copyBgRef} className="hero-copy-bg" aria-hidden="true" />

      {/* CARD: texto encima; luego morphea a blanca */}
      <div
        ref={copyCardRef}
        data-cursor="blue"
        className="hero-copy-card"
        role="note"
        aria-label="Awake intro"
        tabIndex={0}
      >
        <p className="hero-copy-text">
          Awake™ is a digital product studio crafting memorable customer experiences.
        </p>
      </div>

      {/* Mid typing */}
      <div ref={midRef} className="hero-mid" aria-label={TYPE_TEXT} style={{ opacity: 0, visibility: "hidden" }}>
        <p className="hero-mid-text" aria-hidden="true">
          {TYPE_TEXT.split("").map((ch, i) => (
            <span key={i} className="type-letter">
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
          <span className="type-caret" aria-hidden="true">
            |
          </span>
        </p>
      </div>

      {/* CTA */}
      <a ref={talkRef} className="hero-talk" href="#contact" aria-label="Let's talk" style={{ opacity: 0, visibility: "hidden" }}>
        LET&apos;S TALK
      </a>

      {/* Services */}
      <Services inHero />
    </section>
  );
}
