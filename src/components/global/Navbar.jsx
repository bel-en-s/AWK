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

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

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
              { y: -26, x: -6, rotateZ: -2, autoAlpha: 0, filter: "blur(14px)", duration: 0 },
              { y: 6, x: 1, rotateZ: 0.6, autoAlpha: 1, filter: "blur(3px)", duration: 0.22, ease: "power2.out" },
              { y: -2, x: 0, rotateZ: -0.25, filter: "blur(1px)", duration: 0.16, ease: "sine.inOut" },
              { y: 0, x: 0, rotateZ: 0, filter: "blur(0px)", duration: 0.24, ease: "expo.out" },
            ],
          },
          i * 0.18
        );
      });

      return () => tl.kill();
    }, root);

    const tiltEls = Array.from(root.querySelectorAll(".nav-chip, .nav-cta"));
    const cleanups = [];

    const addHoverClass = () => document.documentElement.classList.add("nav-hover");
    const removeHoverClass = () => document.documentElement.classList.remove("nav-hover");

    root.addEventListener("pointerenter", addHoverClass);
    root.addEventListener("pointerleave", removeHoverClass);

    cleanups.push(() => {
      root.removeEventListener("pointerenter", addHoverClass);
      root.removeEventListener("pointerleave", removeHoverClass);
    });

    tiltEls.forEach((el) => {
      gsap.set(el, {
        transformPerspective: 900,
        transformStyle: "preserve-3d",
        transformOrigin: "50% 50%",
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        willChange: "transform",
        force3D: true,
      });

      const rotX = gsap.quickTo(el, "rotateX", {
        duration: 0.22,
        ease: "expo.out",
        overwrite: "auto",
      });
      const rotY = gsap.quickTo(el, "rotateY", {
        duration: 0.22,
        ease: "expo.out",
        overwrite: "auto",
      });
      const scl = gsap.quickTo(el, "scale", {
        duration: 0.18,
        ease: "power3.out",
        overwrite: "auto",
      });

      let active = false;

      const onEnter = () => {
        active = true;
        if (prefersReduced) return;
        scl(1.02);
      };

      const onMove = (e) => {
        if (!active || prefersReduced) return;

        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const dx = px - 0.5;
        const dy = py - 0.5;

        const MAX_Y = 10;
        const MAX_X = 8;

        rotY(dx * MAX_Y);
        rotX(-dy * MAX_X);
      };

      const onLeave = () => {
        active = false;
        if (prefersReduced) return;

        gsap.to(el, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.55,
          ease: "expo.out",
          overwrite: "auto",
        });
      };

      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      el.addEventListener("focus", onEnter);
      el.addEventListener("blur", onLeave);

      cleanups.push(() => {
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        el.removeEventListener("focus", onEnter);
        el.removeEventListener("blur", onLeave);
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
