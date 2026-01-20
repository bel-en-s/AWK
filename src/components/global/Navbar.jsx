// NavBar.jsx
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./Navbar.css";

export default function NavBar({ show = true }) {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    if (!show) return;

    const root = rootRef.current;
    if (!root) return;

    const animItems = Array.from(root.querySelectorAll(".nav-anim"));
    const tiltEls = Array.from(root.querySelectorAll(".nav-chip, .nav-cta"));
    const cta = root.querySelector(".nav-cta");
    const blurItems = animItems.filter((el) => el !== cta);

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const cleanups = [];
    let introTl = null;

    const preset = () => {
      gsap.set(root, { autoAlpha: 0 });

      gsap.set(blurItems, {
        y: -26,
        x: -6,
        rotateZ: -2,
        rotateX: -35,
        autoAlpha: 0,
        filter: "blur(14px)",
        transformPerspective: 900,
        transformOrigin: "50% 0%",
      });

      if (cta) {
        gsap.set(cta, {
          y: -26,
          x: -6,
          rotateZ: -2,
          rotateX: -35,
          autoAlpha: 0,
          filter: "none",
          transformPerspective: 900,
          transformOrigin: "50% 0%",
          mixBlendMode: "difference",
        });
      }
    };

    const playIntro = () => {
      if (prefersReduced) {
        gsap.set(root, { autoAlpha: 1 });
        gsap.set(animItems, { clearProps: "all", autoAlpha: 1 });
        return;
      }

      introTl?.kill();
      gsap.killTweensOf([root, animItems]);

      gsap.set(root, { autoAlpha: 1 });

      introTl = gsap.timeline({ defaults: { ease: "none" } });

      blurItems.forEach((el, i) => {
        introTl.to(
          el,
          {
            duration: 0.62,
            ease: "expo.out",
            keyframes: [
              {
                y: -26,
                x: -6,
                rotateZ: -2,
                rotateX: -35,
                autoAlpha: 0,
                filter: "blur(14px)",
                duration: 0,
              },
              {
                y: 6,
                x: 1,
                rotateZ: 0.6,
                rotateX: -10,
                autoAlpha: 1,
                filter: "blur(3px)",
                duration: 0.22,
                ease: "power2.out",
              },
              {
                y: -2,
                x: 0,
                rotateZ: -0.25,
                rotateX: -4,
                filter: "blur(1px)",
                duration: 0.16,
                ease: "sine.inOut",
              },
              {
                y: 0,
                x: 0,
                rotateZ: 0,
                rotateX: 0,
                filter: "none",
                duration: 0.24,
                ease: "expo.out",
              },
            ],
          },
          i * 0.18
        );
      });

      if (cta) {
        const ctaIndex = animItems.indexOf(cta);
        introTl.to(
          cta,
          {
            duration: 0.62,
            ease: "expo.out",
            keyframes: [
              {
                y: -26,
                x: -6,
                rotateZ: -2,
                rotateX: -35,
                autoAlpha: 0,
                filter: "none",
                duration: 0,
              },
              {
                y: 6,
                x: 1,
                rotateZ: 0.6,
                rotateX: -10,
                autoAlpha: 1,
                filter: "none",
                duration: 0.22,
                ease: "power2.out",
              },
              {
                y: -2,
                x: 0,
                rotateZ: -0.25,
                rotateX: -4,
                filter: "none",
                duration: 0.16,
                ease: "sine.inOut",
              },
              {
                y: 0,
                x: 0,
                rotateZ: 0,
                rotateX: 0,
                filter: "none",
                duration: 0.24,
                ease: "expo.out",
              },
            ],
          },
          Math.max(0, ctaIndex) * 0.18
        );
      }

      introTl.set(animItems, { clearProps: "filter" });
    };

    const start = () => {
      preset();

      if (!window.__AWK_LOADED__) {
        const onLoaded = () => playIntro();
        window.addEventListener("awk:loaded", onLoaded, { once: true });
        cleanups.push(() => window.removeEventListener("awk:loaded", onLoaded));

        const t = window.setTimeout(() => playIntro(), 2500);
        cleanups.push(() => window.clearTimeout(t));
        return;
      }

      playIntro();
    };

    const ctx = gsap.context(() => {
      start();
    }, root);

    const onPageLoad = () => {
      preset();
      playIntro();
    };
    document.addEventListener("astro:page-load", onPageLoad);
    cleanups.push(() =>
      document.removeEventListener("astro:page-load", onPageLoad)
    );

    const addHoverClass = () =>
      document.documentElement.classList.add("nav-hover");
    const removeHoverClass = () =>
      document.documentElement.classList.remove("nav-hover");

    root.addEventListener("pointerenter", addHoverClass);
    root.addEventListener("pointerleave", removeHoverClass);

    cleanups.push(() => {
      root.removeEventListener("pointerenter", addHoverClass);
      root.removeEventListener("pointerleave", removeHoverClass);
    });

    tiltEls.forEach((el, idx) => {
      const dir = idx % 2 === 0 ? -1 : 1;
      const BASE = 8;
      const baseRot = dir * BASE;

      let wiggle = null;

      gsap.set(el, {
        rotateZ: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        transformOrigin: "50% 50%",
        willChange: "transform",
      });

      const enter = () => {
        if (prefersReduced) return;

        gsap.to(el, {
          rotateZ: baseRot,
          scale: 1.03,
          y: -1,
          duration: 0.32,
          ease: "expo.out",
          overwrite: "auto",
        });

        wiggle?.kill();
        wiggle = gsap.to(el, {
          rotateZ: baseRot + dir * 2,
          duration: 0.85,
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

      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      el.addEventListener("focus", enter);
      el.addEventListener("blur", leave);

      cleanups.push(() => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
        el.removeEventListener("focus", enter);
        el.removeEventListener("blur", leave);
        wiggle?.kill();
      });
    });

    return () => {
      introTl?.kill();
      cleanups.forEach((fn) => fn());
      document.documentElement.classList.remove("nav-hover");
      ctx.revert();
    };
  }, [show]);

  const base = import.meta.env.BASE_URL;

  const links = [
    { href: `${base}`, label: "HOME" },
    { href: `${base}work/`, label: "WORK" },
    { href: `${base}people/`, label: "PEOPLE" },
    { href: `${base}blog/`, label: "BLOG" },
  ];

  const logoSrc = `${base}images/ojos.svg`;

  return (
    <nav
      ref={rootRef}
      className="nav"
      aria-label="Primary"
      style={{ opacity: 0, visibility: "hidden" }}
    >
      <a className="nav-logo nav-anim" href={base} aria-label="Home">
        <img className="nav-logoImg" src={logoSrc} alt="" aria-hidden="true" />
      </a>

      <div className="nav-center" role="navigation" aria-label="Sections">
        {links.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            className={`nav-chip nav-anim ${
              i % 2 === 0 ? "is-square" : "is-pill"
            }`}
          >
            {l.label}
          </a>
        ))}
      </div>

      <a className="nav-cta nav-anim invert" href={`${base}contact/`}>
        GET IN TOUCH
      </a>
    </nav>
  );
}