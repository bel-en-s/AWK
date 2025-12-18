import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./NavBar.css";

export default function NavBar({ show = true }) {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    if (!show) return;
    const root = rootRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll(".nav-item"));

    const ctx = gsap.context(() => {
      gsap.set(root, { autoAlpha: 1 });

      gsap.set(items, {
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

      items.forEach((el, i) => {
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

    const onEnter = () => document.documentElement.classList.add("nav-hover");
    const onLeave = () => document.documentElement.classList.remove("nav-hover");

    items.forEach((el) => {
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);
      el.addEventListener("focus", onEnter);
      el.addEventListener("blur", onLeave);
    });

    return () => {
      items.forEach((el) => {
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointerleave", onLeave);
        el.removeEventListener("focus", onEnter);
        el.removeEventListener("blur", onLeave);
      });
      document.documentElement.classList.remove("nav-hover");
      ctx.revert();
    };
  }, [show]);

  return (
    <nav ref={rootRef} className="nav" aria-label="Primary">
      <a className="nav-item" href="#work">WORK</a>
      <a className="nav-item" href="#service">SERVICE</a>
      <a className="nav-item" href="#people">PEOPLE</a>
      <a className="nav-item" href="#blog">BLOG</a>
      <a className="nav-item" href="#contact">GET IN TOUCH</a>
    </nav>
  );
}
