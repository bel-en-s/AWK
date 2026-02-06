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

const TYPE_TEXT = useMemo(() => "Creative Digital Experiences", []);


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

      const midEl = midRef.current;
      const talkEl = talkRef.current;

      if (title && titleLetters.length) {
        title.classList.add("is-ready");

        gsap.set(titleLetters, {
          autoAlpha: 1,
          yPercent: 0,
          rotateX: 0,
          filter: "blur(0px)",
          transformPerspective: 900,
          transformOrigin: "50% 60%",
          willChange: "transform, opacity, filter",
        });

        gsap.to(titleLetters, {
          yPercent: -140,
          autoAlpha: 0,
          rotateX: 55,
          filter: "blur(12px)",
          stagger: { each: 0.04, from: "start" },
          ease: "none",
          scrollTrigger: {
            trigger: heroEl,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * 0.7)}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }

      const PAD = 10;

      const RECT_PAD = 20;

 const RECT_H = isMobile ? 150 : 180;

const rectW = () => Math.min(isMobile ? 320 : 340, window.innerWidth - PAD * 2);
const rectH = () => RECT_H;


      const vhStable = () =>
        Math.round(
          window.visualViewport?.height ||
            document.documentElement.clientHeight ||
            window.innerHeight
        );

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

      if (cursorWrapRef.current) gsap.set(cursorWrapRef.current, { autoAlpha: 1 });

      const svc = heroEl.querySelector(".svc");
      const svcIntroCard = heroEl.querySelector(".svc-introCard");
      const svcTrack = heroEl.querySelector(".svc-track");
      const svcRow = heroEl.querySelector(".svc-row");
      const hasServices = !!(svc && svcTrack && svcRow);

      const getDist = () => {
        if (!hasServices) return 0;
        return Math.max(0, svcRow.scrollWidth - svcTrack.clientWidth);
      };

      const BLUE_AT = 0.32;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
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
            gsap.set(bg, {
              left: PAD,
              bottom: PAD,
              width: rectW(),
              height: rectH(),
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
            });
            if (hasServices) gsap.set(svcRow, { x: 0 });
          },
        },
      });

      tl.to(
        bg,
        {
          left: 0,
          bottom: 0,
          width: () => window.innerWidth,
          height: () => vhStable(),
          duration: 0.55,
        },
        0
      );

      if (title || midEl || talkEl) {
        tl.to([title, midEl, talkEl].filter(Boolean), { autoAlpha: 0, duration: 0.2 }, 0.25);
      }

      const prefersReducedTalk =
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      const isCoarseTalk = window.matchMedia?.("(pointer: coarse)")?.matches;

      let talkEnter, talkLeave, talkFocus, talkBlur, talkWiggle;

      if (talkEl && !prefersReducedTalk && !isCoarseTalk) {
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
      }

      if (hasServices) {
        gsap.set(svc, { autoAlpha: 0, pointerEvents: "none" });

        tl.to(bg, { backgroundColor: "var(--svc-blue, #0A25FF)", duration: 0.14 }, 0.32);
        tl.to(svc, { autoAlpha: 1, duration: 0.12 }, 0.4);
        tl.set(svc, { pointerEvents: "auto" }, 0.42);
        if (isMobile) {
      tl.to([card, bg], { autoAlpha: 0, duration: 0.18 }, 0.44);
      tl.set([card, bg], { pointerEvents: "none" }, 0.44);
    }


        if (!isMobile && svcIntroCard) {
          const measureTarget = () => svcIntroCard.getBoundingClientRect();
          tl.to(
            card,
            {
              left: () => Math.round(measureTarget().left),
              top: () => Math.round(measureTarget().top),
              width: () => Math.round(measureTarget().width),
              backgroundColor: "#fff",
              color: "#000",
              height: "70vh",
              boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
              duration: 0.34,
            },
            0.18
          );
        }
        

        tl.to(
          svcRow,
          {
            x: () => -getDist(),
            duration: 0.75,
          },
          0.6
        );
      }

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
      };
    }, heroEl);

    return () => ctx.revert();
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
          {TYPE_TEXT.split("").map((ch, i) =>
            ch === "\n" ? <br key={i} /> : <span key={i} className="type-letter">{ch === " " ? "\u00A0" : ch}</span>
          )}
          <span className="type-caret" aria-hidden="true">|</span>
        </p>
      </div>

      <a ref={talkRef} className="hero-talk" href="#contact" aria-label="Let's talk">
        LET&apos;S TALK
      </a>

      <Services inHero />
    </section>
  );
}
