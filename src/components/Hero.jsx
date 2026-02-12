import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import CursorLanding from "./global/CursorLanding";
import Services from "./Services";
import "./Hero.css";
import FeaturedLinks from "./FeaturedLinks"; 

gsap.registerPlugin(ScrollTrigger);

const ST_ID = "awk-hero-pin";
const TITLE_ST_ID = "awk-hero-title";
const RESIZE_DEBOUNCE = 120;

function getUAFlags() {
  if (typeof window === "undefined") return { isIOS: false, isMobile: false, isCoarse: false };
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isMobile =
    window.matchMedia?.("(max-width: 920px)")?.matches ||
    window.matchMedia?.("(pointer: coarse)")?.matches;
  const isCoarse = window.matchMedia?.("(pointer: coarse)")?.matches;
  return { isIOS, isMobile, isCoarse };
}

function fontsReady() {
  try {
    return document.fonts?.ready ?? Promise.resolve();
  } catch {
    return Promise.resolve();
  }
}

export default function Hero() {
  const heroRef = useRef(null);
  const cursorWrapRef = useRef(null);
  const copyBgRef = useRef(null);
  const copyCardRef = useRef(null);
  const titleRef = useRef(null);
  const midRef = useRef(null);
  const talkRef = useRef(null);

  const typeIntroPlayedRef = useRef(false);

 const TYPE_TEXT = useMemo(() => "Creative Digital\nExperiences", []);

  useLayoutEffect(() => {
    const heroEl = heroRef.current;
    const bg = copyBgRef.current;
    const card = copyCardRef.current;

    if (!heroEl || !bg || !card) return;

    ScrollTrigger.getById(ST_ID)?.kill(true);
    ScrollTrigger.getById(TITLE_ST_ID)?.kill(true);


    ScrollTrigger.config({ ignoreMobileResize: true });

    const { isIOS, isMobile, isCoarse } = getUAFlags();
    const root = document.documentElement;
    const body = document.body;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const setRootClass = (name, on) => {
      root.classList.toggle(name, !!on);
      body.classList.toggle(name, !!on);
    };

    let lastEyesShow = null;
    const emitEyes = (show) => {
      const v = !!show;
      if (lastEyesShow === v) return;
      lastEyesShow = v;
      window.dispatchEvent(new CustomEvent("awk:eyes", { detail: { show: v } }));
    };

    let stableVH = 0;
    const computeStableVH = () =>
      Math.round(
        window.visualViewport?.height ||
          document.documentElement.clientHeight ||
          window.innerHeight
      );

    const PAD = 10;
    const RECT_PAD = 20;
    const RECT_H = isMobile ? 150 : 280;

    const rectW = () => Math.min(isMobile ? 320 : 380, window.innerWidth - PAD * 2);
    const rectH = () => RECT_H;

    // services refs
    const svc = heroEl.querySelector(".svc");
    const svcIntroCard = heroEl.querySelector(".svc-introCard");
    const svcTrack = heroEl.querySelector(".svc-track");
    const svcRow = heroEl.querySelector(".svc-row");
    const hasServices = !!(svc && svcTrack && svcRow);

    // dist medida SIEMPRE en refresh (no en mount)
    const getDist = () => {
      if (!hasServices) return 0;
      return Math.max(0, svcRow.scrollWidth - svcTrack.clientWidth);
    };

    // =========================
    // BLOCK 2 — initial visual setup (no timelines yet)
    // =========================
    const title = titleRef.current;
    const midEl = midRef.current;
    const talkEl = talkRef.current;

    // Mostrar cursor wrapper si existe
    if (cursorWrapRef.current) gsap.set(cursorWrapRef.current, { autoAlpha: 1 });

    // Sets del rect fijo
    gsap.set(bg, {
      position: "fixed",
      left: PAD,
      bottom: PAD,
      width: rectW(),
      height: rectH(),
      zIndex: 4,
      transformOrigin: "0% 100%",
      scaleX: 1,
      backgroundColor: "#000", 
      scaleY: 1,
      willChange: "left, bottom, width, height, transform, background-color",
    });

    gsap.set(card, {
      position: "fixed",
      left: PAD,
      bottom: PAD,
      width: rectW(),
      height: rectH(),
      zIndex: 7,
      backgroundColor: "transparent",
      color: "#fff",
      padding: RECT_PAD,
      boxShadow: "none",
      willChange:
        "left, top, bottom, width, height, border-radius, background-color, color, padding, box-shadow, opacity, transform",
    });

    // =========================
    // BLOCK 3 — type intro (runs once; waits for awk:loaded or immediately)
    // =========================
    const setupTypeIntro = () => {
      if (!midEl || prefersReduced || typeIntroPlayedRef.current) return;

      const letters = Array.from(midEl.querySelectorAll(".type-letter"));
      const caret = midEl.querySelector(".type-caret");
      if (!letters.length) return;

      gsap.set(midEl, { autoAlpha: 1 });
      gsap.set(letters, { autoAlpha: 0 });
      if (caret) gsap.set(caret, { autoAlpha: 1 });

      const run = () => {
        if (typeIntroPlayedRef.current) return;
        typeIntroPlayedRef.current = true;

        gsap.to(letters, {
          autoAlpha: 1,
          duration: 0,
          stagger: 0.035,
          ease: "none",
          overwrite: "auto",
        });

        if (caret) {
          gsap.to(caret, {
            autoAlpha: 0,
            duration: 0,
            repeat: -1,
            yoyo: true,
            repeatDelay: 0.45,
            delay: 0.1,
            ease: "none",
          });
        }
      };

      if (window.__AWK_LOADED__ === true) {
        run();
      } else {
        const onLoaded = () => {
          window.removeEventListener("awk:loaded", onLoaded);
          requestAnimationFrame(() => requestAnimationFrame(run));
        };
        window.addEventListener("awk:loaded", onLoaded, { once: true });
      }
    };

    setupTypeIntro();

    // =========================
    // BLOCK 4 — title scroll-out (separate ScrollTrigger, independent of pin)
    // =========================
    const setupTitleST = () => {
      if (!title || prefersReduced) return;

      const letters = Array.from(title.querySelectorAll(".hero-title-letter"));
      if (!letters.length) return;

      title.classList.add("is-ready");

      gsap.set(letters, {
        autoAlpha: 1,
        yPercent: 0,
        rotateX: 0,
        filter: "blur(0px)",
        transformPerspective: 900,
        transformOrigin: "50% 60%",
        willChange: "transform, opacity, filter",
      });

      gsap.to(letters, {
        yPercent: -140,
        autoAlpha: 0,
        rotateX: 55,
        filter: "blur(12px)",
        stagger: { each: 0.04, from: "start" },
        ease: "none",
        scrollTrigger: {
          id: TITLE_ST_ID,
          trigger: heroEl,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 0.7)}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    };

    setupTitleST();

    // =========================
    // BLOCK 5 — talk hover (pure GSAP)
    // =========================
    let talkEnter, talkLeave, talkFocus, talkBlur, talkWiggle;

    const setupTalkHover = () => {
      if (!talkEl || prefersReduced || isCoarse) return;

      const BASE = 8;
      const baseRot = -BASE;
      const hoverRot = BASE;

      gsap.set(talkEl, {
        rotateZ: baseRot,
        scale: 1,
        y: 0,
        transformOrigin: "50% 50%",
        willChange: "transform",
        force3D: true,
      });

      const enter = () => {
        gsap.to(talkEl, {
          rotateZ: hoverRot,
          scale: 1.03,
          y: -1,
          duration: 0.32,
          ease: "expo.out",
          overwrite: "auto",
        });

        talkWiggle?.kill();
        talkWiggle = gsap.to(talkEl, {
          rotateZ: hoverRot + 2,
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
          rotateZ: baseRot,
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
    };

    setupTalkHover();

    // =========================
    // BLOCK 6 — main pinned timeline (hero expand + services horizontal)
    // =========================
    let tl;

    const buildPinnedTimeline = () => {
      // medimos estableVH UNA vez por refresh build
      stableVH = computeStableVH();

      const BLUE_AT = 0.32;

      // estado inicial
      if (hasServices) {
        gsap.set(svc, { autoAlpha: 0, pointerEvents: "none" });
        gsap.set(svcRow, { x: 0 });
      }

      // timeline principal
      tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: ST_ID,
          trigger: heroEl,
          start: "top top",
          end: () => `+=${Math.round(stableVH * 1.35 + getDist())}`,
          scrub: 0.9,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          pinType: isIOS ? "fixed" : "transform",

          onToggle: (self) => {
            setRootClass("is-hero-pinning", self.isActive);
            if (!self.isActive) {
              setRootClass("is-eyes-hidden", false);
              emitEyes(false);
              return;
            }
            const blueNow = self.progress >= BLUE_AT;
            emitEyes(!blueNow);
          },

          onUpdate: (self) => {
            const blue = self.progress >= BLUE_AT;
            setRootClass("is-hero-blue", blue);
            setRootClass("is-eyes-hidden", blue);
            if (self.isActive) emitEyes(!blue);
          },

          onRefreshInit: () => {
            stableVH = computeStableVH();

            // reset rect
            gsap.set(bg, {
              left: PAD,
              bottom: PAD,
              width: rectW(),
              height: rectH(),
              backgroundColor: "transparent",
              clearProps: "top",
              backgroundColor: "#000)",
            });

            gsap.set(card, {
              left: PAD,
              bottom: PAD,
              width: rectW(),
              height: rectH(),
              backgroundColor: "transparent",
              color: "#fff",
              padding: RECT_PAD,
              autoAlpha: 1,
              transform: "none",
              clearProps: "top",
            });

            if (hasServices) {
              gsap.set(svc, { autoAlpha: 0, pointerEvents: "none" });
              gsap.set(svcRow, { x: 0 });
            }
          },
        },
      });

      // expand bg full
      tl.to(
        bg,
        {
          left: 0,
          bottom: 0,
          width: () => window.innerWidth,
          height: () => stableVH,
          duration: 0.55,
        },
        0
      );

      // fade-out hero text
      if (title || midEl || talkEl) {
        tl.to([title, midEl, talkEl].filter(Boolean), { autoAlpha: 0, duration: 0.2 }, 0.25);
      }

      // services phase
      if (hasServices) {
        tl.to(bg, { backgroundColor: "var(--svc-blue, #0A25FF)", duration: 0.14 }, 0.32);
        tl.to(svc, { autoAlpha: 1, duration: 0.12 }, 0.4);
        tl.set(svc, { pointerEvents: "auto" }, 0.42);

        if (isMobile) {
          tl.to([card, bg], { autoAlpha: 0, duration: 0.18 }, 0.44);
          tl.set([card, bg], { pointerEvents: "none" }, 0.44);
        }

        // move card to intro card (desktop)
        if (!isMobile && svcIntroCard) {
          const measureTarget = () => svcIntroCard.getBoundingClientRect();
          tl.to(
            card,
            {
              left: () => Math.round(measureTarget().left),
              top: () => Math.round(measureTarget().top),
              width: () => Math.round(measureTarget().width),
              height: "70vh",
              backgroundColor: "#fff",
              color: "#000",
              boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
              duration: 0.34,
            },
            0.18
          );
        }

        // horizontal scroll
        tl.to(
          svcRow,
          {
            x: () => -getDist(),
            duration: 0.75,
          },
          0.6
        );
      }
    };

    // =========================
    // BLOCK 7 — refresh strategy (safe-ish on iOS)
    // =========================
    let resizeT = 0;

    const requestRefresh = () => {
      window.clearTimeout(resizeT);
      resizeT = window.setTimeout(() => {
        // Avoid refresh storms
        ScrollTrigger.refresh(true);
      }, RESIZE_DEBOUNCE);
    };

    const onOrientation = () => requestRefresh();
    const onResize = () => requestRefresh();
    const onVVResize = () => requestRefresh();

    // Build timeline AFTER fonts ready (more stable measures)
    let killed = false;

    (async () => {
      await fontsReady();
      if (killed) return;
      buildPinnedTimeline();
      ScrollTrigger.refresh(true);
    })();

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientation);
    window.visualViewport?.addEventListener?.("resize", onVVResize);

    // =========================
    // CLEANUP
    // =========================
    return () => {
      killed = true;

      window.clearTimeout(resizeT);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientation);
      window.visualViewport?.removeEventListener?.("resize", onVVResize);

      if (talkEl && talkEnter && talkLeave) {
        talkEl.removeEventListener("pointerenter", talkEnter);
        talkEl.removeEventListener("pointerleave", talkLeave);
        talkEl.removeEventListener("focus", talkFocus);
        talkEl.removeEventListener("blur", talkBlur);
        talkWiggle?.kill();
      }

      emitEyes(false);
      setRootClass("is-hero-blue", false);
      setRootClass("is-eyes-hidden", false);
      setRootClass("is-hero-pinning", false);

      // kill the pinned TL and STs explicitly (extra safety)
      tl?.scrollTrigger?.kill(true);
      tl?.kill();

      ScrollTrigger.getById(ST_ID)?.kill(true);
      ScrollTrigger.getById(TITLE_ST_ID)?.kill(true);
    };
  }, []);

  return (
    <section ref={heroRef} className="hero hero--withServices">
      <div ref={cursorWrapRef} className="cursor-landing-wrap">
        <CursorLanding activeAreaRef={heroRef} />
      </div>

      <div className="hero-content" data-cursor="blue">
        <h1 ref={titleRef} className="hero-title" aria-label="AWAKE" data-cursor="blue">
          {"AWAKE".split("").map((ch, i) => (
            <span key={i} className="hero-title-letter" aria-hidden="true">
              {ch}
            </span>
          ))}
        </h1>
      </div>

      <div ref={copyBgRef} className="hero-copy-bg" aria-hidden="true" />

      <div ref={copyCardRef} className="hero-copy-card" role="note" tabIndex={0} data-cursor="blue">
        <p className="hero-copy-text">
          Awake™ is a digital product studio crafting memorable customer experiences.
        </p>
      </div>

     <div ref={midRef} className="hero-mid" aria-label={TYPE_TEXT}>
        <p className="hero-mid-text" aria-hidden="true">
          {TYPE_TEXT.split("\n").map((line, lineIndex) => (
            <span key={lineIndex} className="type-line">
              {line.split("").map((ch, i) => (
                <span
                  key={`${lineIndex}-${i}`}
                  className="type-letter"
                >
                  {ch === " " ? "\u00A0" : ch}
                </span>
              ))}
              {lineIndex === 0 && <br />}
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
