import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import CursorLanding from "./global/CursorLanding";
import NavBar from "./global/Navbar";
import "./Hero.css";

export default function Hero() {
  const [showCursor, setShowCursor] = useState(false);
  const [showNav, setShowNav] = useState(false);

  const heroRef = useRef(null);
  const cursorWrapRef = useRef(null);
  const titleRef = useRef(null);
  const copyRef = useRef(null);
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

    const el = copyRef.current;
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

  useLayoutEffect(() => {
    if (!showCursor) return;

    setShowNav(false);

    const wrap = cursorWrapRef.current;
    const title = titleRef.current;
    if (!wrap || !title) return;

    const letters = title.querySelectorAll(".hero-title-letter");

    const ctx = gsap.context(() => {
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

      const tl = gsap.timeline();

      tl.fromTo(
        wrap,
        { autoAlpha: 0, scale: 0.9, y: 10, filter: "blur(10px)" },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power3.out",
        },
        0
      )
        .to(
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
        )
        .add(() => setShowNav(true), ">+=0.12");

      return () => tl.kill();
    }, title);

    return () => ctx.revert();
  }, [showCursor]);

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

        gsap.to(el, {
          rotateZ: 6,
          duration: 0.32,
          ease: "expo.out",
          overwrite: "auto",
        });

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

        gsap.to(el, {
          rotateZ: -8,
          duration: 0.55,
          ease: "expo.out",
          overwrite: "auto",
        });
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

  return (
    <section ref={heroRef} className="hero">
      {showNav && <NavBar show={showNav} />}

   {showCursor && (
    <div ref={cursorWrapRef} className="cursor-landing-wrap">
      <CursorLanding activeAreaRef={heroRef} eyesOnlyInside />
    </div>
  )}

      <div className="hero-content">
        <h1 ref={titleRef}  data-cursor="invert" className="hero-title" aria-label="AWAKE">
          {"AWAKE".split("").map((ch, i) => (
            <span key={i} className="hero-title-letter" aria-hidden="true">
              {ch}
            </span>
          ))}
        </h1>
      </div>

      <div
        ref={copyRef}
        className="hero-copy"
        role="note"
        aria-label="Awake intro"
        tabIndex={0}
      >
        <p className="hero-copy-text">
          Awake™ is a digital product studio crafting memorable customer
          experiences.
        </p>
      </div>

     <a ref={talkRef} className="hero-talk" href="#contact" aria-label="Let's talk">
  LET&apos;S TALK
</a>

    </section>
  );
}
