import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import CursorLanding from "./global/CursorLanding";
import Services from "./Services";
import "./Hero.css";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const [showCursor, setShowCursor] = useState(false);
  const [showNav, setShowNav] = useState(false);

  const heroRef = useRef(null);
  const cursorWrapRef = useRef(null);
  const titleRef = useRef(null);

  const copyBgRef = useRef(null);
  const copyCardRef = useRef(null);

  const midRef = useRef(null);
  const talkRef = useRef(null);

  useEffect(() => {
    const already = !!window.__AWK_LOADED__;
    if (already) {
      setShowCursor(true);
      return;
    }
    const onLoaded = () => setShowCursor(true);
    window.addEventListener("awk:loaded", onLoaded);
    return () => window.removeEventListener("awk:loaded", onLoaded);
  }, []);

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

  // ====== Intro timeline (igual vibe que tenías, pero aplicado a bg+card) ======
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

      gsap.set(bg, { autoAlpha: 0, y: 10, filter: "blur(10px)" });
      gsap.set(card, { autoAlpha: 0, y: 10, filter: "blur(10px)" });

      gsap.set(midEl, { autoAlpha: 1 });
      gsap.set(typeLetters, { autoAlpha: 0 });
      if (caret) gsap.set(caret, { autoAlpha: 0 });

      gsap.set(talkEl, { autoAlpha: 0, y: 6, filter: "blur(8px)" });

      if (prefersReduced) {
        gsap.set(wrap, { autoAlpha: 1, scale: 1, y: 0, filter: "blur(0px)" });
        gsap.set(letters, { yPercent: 0, rotateX: 0, autoAlpha: 1, filter: "blur(0px)" });
        gsap.set([bg, card], { autoAlpha: 1, y: 0, filter: "blur(0px)" });
        gsap.set(typeLetters, { autoAlpha: 1 });
        if (caret) gsap.set(caret, { autoAlpha: 1 });
        gsap.set(talkEl, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
        setShowNav(true);
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

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

      tl.to([bg, card], { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: "expo.out" }, ">-0.05");

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

      return () => tl.kill();
    }, heroEl);

    return () => ctx.revert();
  }, [showCursor]);

  // ====== Sync hero center with nav center ======
  useLayoutEffect(() => {
    if (!showNav) return;

    const heroEl = heroRef.current;
    if (!heroEl) return;

    const navCenter = document.querySelector(".nav .nav-center");
    if (!navCenter) return;

    const apply = () => {
      const r = navCenter.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      heroEl.style.setProperty("--hero-center-x", `${cx}px`);
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(navCenter);

    window.addEventListener("resize", apply);
    const raf = requestAnimationFrame(apply);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", apply);
      ro.disconnect();
    };
  }, [showNav]);

  // ====== Wiggle CTA ======
  useLayoutEffect(() => {
    const el = talkRef.current;
    if (!el) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const ctx = gsap.context(() => {
      gsap.set(el, { rotateZ: -8, transformOrigin: "50% 50%", willChange: "transform", force3D: true });

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

  // ====== MASTER PIN: bg black -> fullscreen blue + card morph a white slot ======
  useLayoutEffect(() => {
    if (!showCursor) return;

    const heroEl = heroRef.current;
    const bg = copyBgRef.current;
    const card = copyCardRef.current;
    const title = titleRef.current;
    const midEl = midRef.current;
    const talkEl = talkRef.current;

    if (!heroEl || !bg || !card) return;

    const ctx = gsap.context(() => {
      const svc = heroEl.querySelector(".svc");
      const svcIntroCard = heroEl.querySelector(".svc-introCard"); // ocupa espacio
      const svcTrack = heroEl.querySelector(".svc-track");
      const svcRow = heroEl.querySelector(".svc-row");

      if (!svc || !svcIntroCard || !svcTrack || !svcRow) return;

      const prefersReduced =
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

      const getDist = () => Math.max(0, svcRow.scrollWidth - svcTrack.clientWidth);

      // Estado base y mediciones consistentes
      const resetForMeasure = () => {
        gsap.set([bg, card], {
          clearProps: "top,right,width,height",
        });
        gsap.set(bg, { left: 10, bottom: 10, top: "auto", right: "auto" });
        gsap.set(card, { left: 10, bottom: 10, top: "auto", right: "auto" });
      };

      const measure = () => {
        resetForMeasure();

        // fijamos width/height iniciales (auto no anima bien)
        const bgR = bg.getBoundingClientRect();
        const cR = card.getBoundingClientRect();

        gsap.set(bg, { width: bgR.width, height: bgR.height });
        gsap.set(card, { width: cR.width, height: cR.height });

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

      // clave: NO mostrar la introCard real (evita duplicado) pero deja layout
      gsap.set(svcIntroCard, { autoAlpha: 0 });

      if (prefersReduced) {
        ScrollTrigger.create({
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

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroEl,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 1.25 + getDist())}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // 1) BG (negro) se expande a fullscreen
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
          boxShadow: "none",
          ease: "none",
          duration: 0.52,
        },
        0
      );

      // 2) Apaga UI del hero
      tl.to(
        [title, midEl, talkEl],
        { autoAlpha: 0, filter: "blur(10px)", duration: 0.18, ease: "none" },
        0.22
      );

      // 3) BG cambia a azul (mientras expande)
      tl.to(
        bg,
        {
          backgroundColor: "var(--svc-blue, #0A25FF)",
          duration: 0.18,
          ease: "none",
        },
        0.30
      );

      // 4) Services aparece (sin “flash”, porque el azul ya viene del bg)
      tl.to(svc, { autoAlpha: 1, duration: 0.12, ease: "none" }, 0.40);
      tl.set(svc, { pointerEvents: "auto" }, 0.42);

      // 5) La card (con texto) MORPHEA a la blanca, hacia el slot de la introCard
      tl.to(
        card,
        {
          left: () => {
            const m = measure();
            return Math.round(m.toLeft - m.heroLeft);
          },
          top: () => {
            const m = measure();
            return Math.round(m.toTop - m.heroTop);
          },
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

      // 6) Horizontal scroll
      tl.to(
        svcRow,
        {
          x: () => -getDist(),
          ease: "none",
          duration: 0.48,
        },
        0.62
      );

      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoad);

      return () => {
        window.removeEventListener("load", onLoad);
        ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
        tl.kill();
      };
    }, heroEl);

    return () => ctx.revert();
  }, [showCursor]);

  const TYPE_TEXT = "Creative digital experiences";

  return (
    <section ref={heroRef} className="hero hero--withServices">
      {showCursor && (
        <div ref={cursorWrapRef} className="cursor-landing-wrap" style={{ opacity: 0, visibility: "hidden" }}>
          <CursorLanding activeAreaRef={heroRef} />
        </div>
      )}

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

      {/* BG (negro -> fullscreen azul) */}
      <div
        ref={copyBgRef}
        className="hero-copy-bg"
        aria-hidden="true"
        style={{ opacity: 0, visibility: "hidden" }}
      />

      {/* CARD (texto) — es el MISMO div que morphea a la card blanca */}
      <div
        ref={copyCardRef}
        data-cursor="blue"
        className="hero-copy-card"
        role="note"
        aria-label="Awake intro"
        tabIndex={0}
        style={{ opacity: 0, visibility: "hidden" }}
      >
        <p className="hero-copy-text">
          Awake™ is a digital product studio crafting memorable customer experiences.
        </p>
      </div>

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

      <a
        ref={talkRef}
        className="hero-talk"
        href="#contact"
        aria-label="Let's talk"
        style={{ opacity: 0, visibility: "hidden" }}
      >
        LET&apos;S TALK
      </a>

      <Services inHero />
    </section>
  );
}
