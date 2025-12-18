import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import CursorLanding from "./global/CursorLanding";
import NavBar from "./global/NavBar";
import "./Hero.css";

export default function Hero() {
  const [showCursor, setShowCursor] = useState(false);
  const [showNav, setShowNav] = useState(false);

  const cursorWrapRef = useRef(null);
  const titleRef = useRef(null);
  const copyRef = useRef(null);

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
        { autoAlpha: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
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

  return (
    <section className="hero">
      {showNav && <NavBar show={showNav} />}

      {showCursor && (
        <div ref={cursorWrapRef} className="cursor-landing-wrap">
          <CursorLanding />
        </div>
      )}

      <div className="hero-content">
        <h1 ref={titleRef} className="hero-title" aria-label="AWAKE">
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
        <div className="hero-copy-title">AWAKE</div>
        <p className="hero-copy-text">
          Awake™ is a digital product studio crafting memorable customer experiences.
        </p>
      </div>

      <a className="hero-talk" href="#contact" aria-label="Let's talk">
        LET&apos;S
        <br />
        TALK
      </a>
    </section>
  );
}
