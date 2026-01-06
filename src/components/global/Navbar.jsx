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

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const cleanups = [];

    // =========================
    // Intro animation
    // =========================
    const ctx = gsap.context(() => {
      gsap.set(root, { autoAlpha: 1 });

      gsap.set(animItems, {
        y: -26,
        x: -6,
        rotateZ: -2,
        rotateX: -35,
        autoAlpha: 0,
        filter: "blur(14px)",
        transformPerspective: 900,
        transformOrigin: "50% 0%",
        force3D: true,
      });

      const tl = gsap.timeline({ defaults: { ease: "none" } });

      animItems.forEach((el, i) => {
        tl.to(
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
                filter: "blur(0px)",
                duration: 0.24,
                ease: "expo.out",
              },
            ],
          },
          i * 0.18
        );
      });

      return () => tl.kill();
    }, root);

    // =========================
    // html hover class
    // =========================
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

    // =========================
    // Tilt hover (tipo talkRef: enter / leave)
    // =========================
    tiltEls.forEach((el, idx) => {
      const dir = idx % 2 === 0 ? -1 : 1; // alterna izq/der
      const BASE = 8; // grados base del tilt
      const baseRot = dir * BASE;

      let wiggle = null;

      // base estable
      gsap.set(el, {
        rotateZ: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        transformOrigin: "50% 50%",
        willChange: "transform",
        force3D: true,
      });

      const enter = () => {
        if (prefersReduced) return;

        // tilt inmediato suave
        gsap.to(el, {
          rotateZ: baseRot,
          scale: 1.03,
          y: -1,
          duration: 0.32,
          ease: "expo.out",
          overwrite: "auto",
        });

        // micro “respiración” opcional (muy sutil)
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
      cleanups.forEach((fn) => fn());
      document.documentElement.classList.remove("nav-hover");
      ctx.revert();
    };
  }, [show]);

  const links = [
    { href: "#work", label: "WORK" },
    { href: "#service", label: "SERVICE" },
    { href: "#people", label: "PEOPLE" },
    { href: "#blog", label: "BLOG" },
  ];

  const logoSrc = `${import.meta.env.BASE_URL}images/ojos.svg`;

  return (
    <nav ref={rootRef} className="nav" aria-label="Primary">
      <a className="nav-logo nav-anim" href="#top" aria-label="Home">
        <img className="nav-logoImg" src={logoSrc} alt="" aria-hidden="true" />
      </a>

      <div className="nav-center" role="navigation" aria-label="Sections">
        {links.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            className={`nav-chip nav-anim ${i % 2 === 0 ? "is-square" : "is-pill"}`}
          >
            {l.label}
          </a>
        ))}
      </div>

      <a className="nav-cta nav-anim" href="#contact">
        GET IN TOUCH
      </a>
    </nav>
  );
}
