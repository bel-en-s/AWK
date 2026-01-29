
// Hero.jsx
import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import CursorLanding from "./global/CursorLanding";
import Services from "./Services";
import "./Hero.css";
import FeaturedLinks from "./FeaturedLinks";
gsap.registerPlugin(ScrollTrigger);

if (typeof window !== "undefined") {
  window.ScrollTrigger = ScrollTrigger;
}

export default function Hero() {
  const heroRef = useRef(null);
  const cursorWrapRef = useRef(null);

  const copyBgRef = useRef(null);
  const copyCardRef = useRef(null);

  const titleRef = useRef(null);
  const midRef = useRef(null);
  const talkRef = useRef(null);

  const TYPE_TEXT = useMemo(() => "Creative Digital\nExperiences", []);

  useLayoutEffect(() => {
    const heroEl = heroRef.current;
    const bg = copyBgRef.current;
    const card = copyCardRef.current;

    if (!heroEl || !bg || !card) return;

    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua);

    const isMobile =
      window.matchMedia?.("(max-width: 920px)")?.matches ||
      window.matchMedia?.("(pointer: coarse)")?.matches;

    const root = document.documentElement;
    const body = document.body;

    const setRootClass = (name, on) => {
      root.classList.toggle(name, !!on);
      body.classList.toggle(name, !!on);
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.config({ ignoreMobileResize: true });

      // ✅ helper: avisar a CursorLanding si los ojos deben verse o no
      let lastEyesShow = null;
      const emitEyes = (show) => {
        const v = !!show;
        if (lastEyesShow === v) return;
        lastEyesShow = v;
        window.dispatchEvent(new CustomEvent("awk:eyes", { detail: { show: v } }));
      };

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
      // Base geometry
      // ----------------------------
      const PAD = 10;
      const RECT_H = 180;
      const RECT_PAD = 20;

      const rectW = () => Math.min(340, window.innerWidth - PAD * 2);
      const rectH = () => RECT_H;

      // ✅ altura estable (iOS address bar safe)
      const vhStable = () =>
        Math.round(
          window.visualViewport?.height ||
            document.documentElement.clientHeight ||
            window.innerHeight
        );

      // BG fixed
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
        willChange: "left, bottom, width, height, transform, background-color",
      });

      // CARD fixed (copy)
      gsap.set(card, {
        position: "fixed",
        left: PAD,
        bottom: PAD,
        top: "auto",
        right: "auto",
        width: rectW(),
        height: rectH(),
        zIndex: 7,
        borderRadius: 0,
        backgroundColor: "transparent",
        color: "#fff",
        padding: RECT_PAD,
        boxShadow: "none",
        willChange:
          "left, top, bottom, width, height, border-radius, background-color, color, padding, box-shadow, opacity, transform",
      });

      // Cursor arriba
      if (cursorWrapRef.current) gsap.set(cursorWrapRef.current, { autoAlpha: 1 });

      // ----------------------------
      // Services optional
      // ----------------------------
      const svc = heroEl.querySelector(".svc");
      const svcIntroCard = heroEl.querySelector(".svc-introCard"); // ✅ target
      const svcTrack = heroEl.querySelector(".svc-track");
      const svcRow = heroEl.querySelector(".svc-row");
      const hasServices = !!(svc && svcTrack && svcRow);

      const getDist = () => {
        if (!hasServices) return 0;
        return Math.max(0, svcRow.scrollWidth - svcTrack.clientWidth);
      };

      // ----------------------------
      // Main timeline (pin)
      // ----------------------------
      const BLUE_AT = 0.32;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "HERO_MAIN",
          trigger: heroEl,
          start: "top top",
          end: () => `+=${Math.round(vhStable() * 1.35 + getDist())}`,
          scrub: 0.9,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          pinType: isIOS ? "fixed" : "transform",

          onToggle: (self) => {
            setRootClass("is-hero-pinning", self.isActive);

            if (!self.isActive) {
              setRootClass("is-hero-blue", false);
              setRootClass("is-eyes-hidden", false);

              // ✅ fuera del hero -> ojos OFF
              emitEyes(false);
              return;
            }

            // ✅ si entra activo, decide según progreso actual
            const blueNow = self.progress >= BLUE_AT;
            emitEyes(!blueNow);
          },

          onUpdate: (self) => {
            const blue = self.progress >= BLUE_AT;
            setRootClass("is-hero-blue", blue);
            setRootClass("is-eyes-hidden", blue);

            // ✅ en azul -> ojos OFF, en negro -> ojos ON (solo mientras está activo)
            if (self.isActive) emitEyes(!blue);
          },

          onRefreshInit: () => {
            // reset base antes de medir
            gsap.set(bg, {
              left: PAD,
              bottom: PAD,
              width: rectW(),
              height: rectH(),
              scaleX: 1,
              scaleY: 1,
              borderRadius: 0,
            });

            gsap.set(card, {
              left: PAD,
              bottom: PAD,
              top: "auto",
              right: "auto",
              width: rectW(),
              height: rectH(),
              borderRadius: 0,
              backgroundColor: "transparent",
              color: "#fff",
              padding: RECT_PAD,
              boxShadow: "none",
              autoAlpha: 1,
              transform: "none",
            });

            if (hasServices) gsap.set(svcRow, { x: 0 });
          },
        },
      });

      // 1) expand BG fullscreen (✅ sin PAD: pega a 0,0)
      tl.to(
        bg,
        {
          left: 0,
          bottom: 0,
          width: () => window.innerWidth,
          height: () => vhStable(),
          scaleX: 1,
          scaleY: 1,
          borderRadius: 0,
          boxShadow: "none",
          duration: 0.55,
        },
        0
      );

      // 2) ocultar UI del hero (title + type + talk)
      const midEl = midRef.current;
      const talkEl = talkRef.current;
      if (title || midEl || talkEl) {
        tl.to(
          [title, midEl, talkEl].filter(Boolean),
          { autoAlpha: 0, duration: 0.2 },
          0.25
        );
      }

      // ----------------------------
      // LET'S TALK hover tilt (refactor: igual a nav items)
      // ----------------------------
      const prefersReducedTalk =
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      const isCoarseTalk = window.matchMedia?.("(pointer: coarse)")?.matches;

      let talkEnter = null;
      let talkLeave = null;
      let talkFocus = null;
      let talkBlur = null;
      let talkWiggle = null;

      if (talkEl && !prefersReducedTalk && !isCoarseTalk) {
        const dir = 1; // poné -1 si lo querés al otro lado
        const BASE = 8;
        const baseRot = dir * BASE;

        gsap.set(talkEl, {
          rotateZ: 0,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          y: 0,
          transformOrigin: "50% 50%",
          willChange: "transform",
          force3D: true,
        });

        const enter = () => {
          gsap.to(talkEl, {
            rotateZ: baseRot,
            scale: 1.03,
            y: -1,
            duration: 0.32,
            ease: "expo.out",
            overwrite: "auto",
          });

          talkWiggle?.kill();
          talkWiggle = gsap.to(talkEl, {
            rotateZ: baseRot + dir * 2,
            duration: 0.85,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            overwrite: "auto",
          });
        };

        const leave = () => {
          talkWiggle?.kill();
          talkWiggle = null;

          gsap.to(talkEl, {
            rotateZ: 0,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            y: 0,
            duration: 0.55,
            ease: "expo.out",
            overwrite: "auto",
          });
        };

        talkEnter = enter;
        talkLeave = leave;
        talkFocus = enter;
        talkBlur = leave;

        talkEl.addEventListener("pointerenter", talkEnter);
        talkEl.addEventListener("pointerleave", talkLeave);
        talkEl.addEventListener("focus", talkFocus);
        talkEl.addEventListener("blur", talkBlur);
      }

      if (hasServices) {
        gsap.set(svc, { autoAlpha: 0, pointerEvents: "none" });

        // BG to blue
        tl.to(bg, { backgroundColor: "var(--svc-blue, #0A25FF)", duration: 0.14 }, 0.32);

        // Services on
        tl.to(svc, { autoAlpha: 1, duration: 0.12 }, 0.40);
        tl.set(svc, { pointerEvents: "auto" }, 0.42);

        if (!isMobile) {
          if (svcIntroCard) {
            const measureTarget = () => svcIntroCard.getBoundingClientRect();

            tl.to(
              card,
              {
                left: () => Math.round(measureTarget().left),
                top: () => Math.round(measureTarget().top),
                bottom: "auto",
                right: "auto",
                width: () => Math.round(measureTarget().width),
                height: () => Math.round(measureTarget().height),

                backgroundColor: "#fff",
                color: "#000",
                padding: 24,
                // borderRadius: 22,
                boxShadow: "0 18px 50px rgba(0,0,0,0.18)",

                duration: 0.34,
              },
              0.18
            );
          } else {
            tl.to(
              card,
              {
                backgroundColor: "#fff",
                color: "#000",
                padding: 24,
                borderRadius: 22,
                boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
                duration: 0.22,
              },
              0.18
            );
          }
        } else {
          tl.to(
            card,
            {
              y: -20,
              scale: 0.98,
              autoAlpha: 0,
              duration: 0.18,
              onComplete: () => {
                card.style.pointerEvents = "none";
              },
            },
            0.18
          );
        }

        // Horizontal scroll
        tl.to(
          svcRow,
          {
            x: () => -getDist(),
            duration: 0.75,
          },
          0.60
        );
      }

      // ----------------------------
      // Resize -> refresh (throttled)
      // ----------------------------
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

        if (talkRef.current && talkEnter && talkLeave) {
          const el = talkRef.current;
          el.removeEventListener("pointerenter", talkEnter);
          el.removeEventListener("pointerleave", talkLeave);
          if (talkFocus) el.removeEventListener("focus", talkFocus);
          if (talkBlur) el.removeEventListener("blur", talkBlur);
          talkWiggle?.kill();
        }

        // ✅ al desmontar Hero -> ojos OFF
        emitEyes(false);

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

      <div className="hero-content"  data-cursor="blue" >
        <h1 ref={titleRef} className="hero-title" aria-label="AWAKE"  data-cursor="blue" >
          {"AWAKE".split("").map((ch, i) => (
            <span key={i} className="hero-title-letter" aria-hidden="true">
              {ch}
            </span>
          ))}
        </h1>
      </div>

      <div ref={copyBgRef} className="hero-copy-bg" aria-hidden="true" />

      {/* ESTE ES EL COPY QUE MORPHEA A CARD BLANCA (desktop), y se oculta en mobile */}
      <div ref={copyCardRef} className="hero-copy-card" role="note" tabIndex={0}  data-cursor="blue" >
        <p className="hero-copy-text">
          Awake™ is a digital product studio crafting memorable customer experiences.
        </p>
      </div>

      <div ref={midRef} className="hero-mid" aria-label={TYPE_TEXT}>
        <p className="hero-mid-text" aria-hidden="true">
          {TYPE_TEXT.split("").map((ch, i) =>
            ch === "\n" ? (
              <br key={`br-${i}`} />
            ) : (
              <span key={i} className="type-letter">
                {ch === " " ? "\u00A0" : ch}
              </span>
            )
          )}
          <span className="type-caret" aria-hidden="true">
            |
          </span>
        </p>
      </div>

      <a ref={talkRef} className="hero-talk" href="#contact" aria-label="Let's talk" >
        LET&apos;S TALK
      </a>

      <Services inHero />
    </section>
  );
}

