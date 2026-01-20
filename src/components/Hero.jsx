
import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import CursorLanding from "./global/CursorLanding";
import Services from "./Services";
import "./Hero.css";

gsap.registerPlugin(ScrollTrigger);

// ✅ Lenis bridge (tu lenis.jsx usa window.ScrollTrigger?.update?.())
if (typeof window !== "undefined") {
  window.ScrollTrigger = ScrollTrigger;
}

export default function Hero() {
  const heroRef = useRef(null);
  const cursorWrapRef = useRef(null);

  const copyBgRef = useRef(null);
  const copyCardRef = useRef(null);
  const copyInnerRef = useRef(null);

  const titleRef = useRef(null);
  const midRef = useRef(null);
  const talkRef = useRef(null);

  const TYPE_TEXT = useMemo(() => "Creative Digital Experiences", []);

  useLayoutEffect(() => {
    const heroEl = heroRef.current;
    const bg = copyBgRef.current;
    const card = copyCardRef.current;
    const inner = copyInnerRef.current;

    if (!heroEl || !bg || !card || !inner) return;

    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua);

    const root = document.documentElement;
    const body = document.body;

    const setRootClass = (name, on) => {
      root.classList.toggle(name, !!on);
      body.classList.toggle(name, !!on);
    };

    const ctx = gsap.context(() => {
      // ✅ evita refreshes por cambios de barra en mobile
      ScrollTrigger.config({ ignoreMobileResize: true });

      // ----------------------------
      // Intro AWAKE (letters)
      // ----------------------------
      const title = titleRef.current;
      const titleLetters = title
        ? Array.from(title.querySelectorAll(".hero-title-letter"))
        : [];

      if (title && titleLetters.length) {
        title.classList.add("is-ready");

        gsap.set(titleLetters, { transformPerspective: 900 });
        gsap.fromTo(
          titleLetters,
          { autoAlpha: 0, yPercent: 60, rotateX: -60, filter: "blur(10px)" },
          {
            autoAlpha: 1,
            yPercent: 0,
            rotateX: 0,
            filter: "blur(0px)",
            duration: 0.75,
            ease: "expo.out",
            stagger: 0.06,
            clearProps: "filter",
          }
        );
      }

      // ----------------------------
      // Base geometry (NO layout animation)
      // ----------------------------
      const PAD = 10;
      const RECT_H = 180;

      const rectW = () => Math.min(340, window.innerWidth - PAD * 2);
      const rectH = () => RECT_H;

      // ✅ altura estable (iOS address bar safe)
      const vhStable = () =>
        Math.round(
          window.visualViewport?.height ||
            document.documentElement.clientHeight ||
            window.innerHeight
        );

      // BG y card: fixed + transforms (butter)
      gsap.set(bg, {
        position: "fixed",
        left: PAD,
        bottom: PAD,
        width: rectW(),
        height: rectH(),
        zIndex: 4,
        transformOrigin: "0% 100%",
        scaleX: 1,
        scaleY: 1,
        willChange: "transform, border-radius, background-color",
      });

      gsap.set(card, {
        position: "fixed",
        left: PAD,
        bottom: PAD,
        width: rectW(),
        height: rectH(),
        zIndex: 7,
        transformOrigin: "0% 100%",
        scaleX: 1,
        scaleY: 1,
        willChange: "transform, border-radius, padding, color",
      });

      gsap.set(inner, {
        transformOrigin: "0% 100%",
        scaleX: 1,
        scaleY: 1,
        willChange: "transform",
      });

      // Cursor arriba
      if (cursorWrapRef.current) gsap.set(cursorWrapRef.current, { autoAlpha: 1 });

      const computeScales = () => {
        const w = rectW();
        const h = rectH();
        return { sx: window.innerWidth / w, sy: vhStable() / h };
      };

      // ----------------------------
      // Services optional
      // ----------------------------
      const svc = heroEl.querySelector(".svc");
      const svcTrack = heroEl.querySelector(".svc-track");
      const svcRow = heroEl.querySelector(".svc-row");
      const hasServices = !!(svc && svcTrack && svcRow);

      const getDist = () => {
        if (!hasServices) return 0;
        return Math.max(0, svcRow.scrollWidth - svcTrack.clientWidth);
      };

      // ----------------------------
      // Timeline butter (scrub + pin)
      // ----------------------------
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "HERO_MAIN",
          trigger: heroEl,
          start: "top top",

          // ✅ end estable (no depende de innerHeight cambiante)
          end: () => `+=${Math.round(vhStable() * 1.35 + getDist())}`,

          scrub: 0.9,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,

          // ✅ iOS fixed pin suele ser más estable
          pinType: isIOS ? "fixed" : "transform",

          onToggle: (self) => {
            setRootClass("is-hero-pinning", self.isActive);
            if (!self.isActive) {
              setRootClass("is-hero-blue", false);
              setRootClass("is-eyes-hidden", false);
            }
          },

          onRefreshInit: () => {
            // reset base antes de medir
            gsap.set([bg, card], {
              left: PAD,
              bottom: PAD,
              width: rectW(),
              height: rectH(),
              scaleX: 1,
              scaleY: 1,
            });
            gsap.set(inner, { scaleX: 1, scaleY: 1 });
            if (hasServices) gsap.set(svcRow, { x: 0 });
          },
        },
      });

      // 1) expand BG fullscreen
      tl.to(
        bg,
        {
          scaleX: () => computeScales().sx,
          scaleY: () => computeScales().sy,
          borderRadius: 0,
          boxShadow: "none",
          duration: 0.55,
        },
        0
      );

      // 2) card acompaña + morph props
      tl.to(
        card,
        {
          scaleX: () => computeScales().sx,
          scaleY: () => computeScales().sy,
          borderRadius: 0,
          padding: 24,
          duration: 0.55,
        },
        0
      );

      // 3) counter-scale: texto NO crece
      tl.to(
        inner,
        {
          scaleX: () => 1 / computeScales().sx,
          scaleY: () => 1 / computeScales().sy,
          duration: 0.55,
        },
        0
      );

      // 4) ocultar UI del hero un poco después
      const midEl = midRef.current;
      const talkEl = talkRef.current;
      if (title || midEl || talkEl) {
        tl.to(
          [title, midEl, talkEl].filter(Boolean),
          { autoAlpha: 0, duration: 0.2 },
          0.25
        );
      }

      // 5) services + modo azul + ocultar ojos
      if (hasServices) {
        gsap.set(svc, { autoAlpha: 0, pointerEvents: "none" });

        tl.add(() => {
          setRootClass("is-hero-blue", true);
          setRootClass("is-eyes-hidden", true);
        }, 0.32);

        tl.to(bg, { backgroundColor: "var(--svc-blue, #0A25FF)", duration: 0.14 }, 0.32);

        tl.to(svc, { autoAlpha: 1, duration: 0.12 }, 0.40);
        tl.set(svc, { pointerEvents: "auto" }, 0.42);

        tl.to(
          svcRow,
          {
            x: () => -getDist(),
            duration: 0.75,
          },
          0.60
        );

        // scrub hacia atrás: sacar azul/ojos si volvés al inicio
        tl.add(() => {
          const st = ScrollTrigger.getById("HERO_MAIN");
          if (st && st.progress < 0.34) {
            setRootClass("is-hero-blue", false);
            setRootClass("is-eyes-hidden", false);
          }
        }, 0.33);
      }

      // refresh controlado (evita spam)
      let raf = 0;
      const onResize = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => ScrollTrigger.refresh(true));
      };
      window.addEventListener("resize", onResize);

      ScrollTrigger.refresh(true);

      return () => {
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(raf);
        setRootClass("is-hero-blue", false);
        setRootClass("is-eyes-hidden", false);
        setRootClass("is-hero-pinning", false);
      };
    }, heroEl);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="hero hero--withServices">
      <div ref={cursorWrapRef} className="cursor-landing-wrap">
        <CursorLanding activeAreaRef={heroRef} />
      </div>

      <div className="hero-content">
        <h1 ref={titleRef} className="hero-title" aria-label="AWAKE">
          {"AWAKE".split("").map((ch, i) => (
            <span key={i} className="hero-title-letter" aria-hidden="true">
              {ch}
            </span>
          ))}
        </h1>
      </div>

      <div ref={copyBgRef} className="hero-copy-bg" aria-hidden="true" />

      <div ref={copyCardRef} className="hero-copy-card" role="note" tabIndex={0}>
        <div ref={copyInnerRef} className="hero-copy-inner">
          <p className="hero-copy-text">
            Awake™ is a digital product studio crafting memorable customer experiences.
          </p>
        </div>
      </div>

      <div ref={midRef} className="hero-mid" aria-label={TYPE_TEXT}>
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

      <a ref={talkRef} className="hero-talk" href="#contact" aria-label="Let's talk">
        LET&apos;S TALK
      </a>

      <Services inHero />
    </section>
  );
}

