import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./TransitionBlocks.css";

const BLOCKS = 12;

export default function TransitionBlocks() {
  const gridRef = useRef(null);
  const blocksRef = useRef([]);
  const builtRef = useRef(false);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const build = () => {
    const grid = gridRef.current;
    if (!grid) return;

    grid.innerHTML = "";
    blocksRef.current = [];

    const w = window.innerWidth;
    const h = window.innerHeight;
    const bw = w / BLOCKS;

    for (let i = 0; i < BLOCKS; i++) {
      const b = document.createElement("div");
      b.className = "trb-block";
      b.style.width = `${bw + 6}px`;
      b.style.height = `${h}px`;
      b.style.left = `${i * bw}px`;
      b.style.marginLeft = "-3px";
      grid.appendChild(b);
      blocksRef.current.push(b);
    }

    gsap.set(grid, { autoAlpha: 0, pointerEvents: "none" });
    gsap.set(blocksRef.current, {
      scaleX: 0,
      transformOrigin: "left",
      filter: "blur(10px)",
      rotateZ: 0.25,
      force3D: true,
    });

    builtRef.current = true;
  };

  const cover = () =>
    new Promise((resolve) => {
      const grid = gridRef.current;
      const blocks = blocksRef.current;
      if (!grid || !blocks.length || prefersReduced) return resolve();

      window.__TRB_NEEDS_REVEAL__ = true;

      gsap.killTweensOf([grid, blocks]);

      gsap.set(grid, { autoAlpha: 1, pointerEvents: "auto" });
      gsap.set(blocks, { scaleX: 0, transformOrigin: "left" });

      gsap.to(blocks, {
        scaleX: 1,
        filter: "blur(0px)",
        rotateZ: 0,
        duration: 0.5,
        ease: "power3.out",
        stagger: { amount: 0.28, from: "start" },
        onComplete: resolve,
      });
    });

  const reveal = () =>
    new Promise((resolve) => {
      const grid = gridRef.current;
      const blocks = blocksRef.current;
      if (!grid || !blocks.length || prefersReduced) return resolve();

      gsap.killTweensOf([grid, blocks]);

      gsap.set(grid, { autoAlpha: 1, pointerEvents: "auto" });
      gsap.set(blocks, { scaleX: 1, transformOrigin: "right" });

      gsap.to(blocks, {
        scaleX: 0,
        filter: "blur(12px)",
        rotateZ: -0.25,
        duration: 0.25,
        ease: "power3.out",
        stagger: { amount: 0.28, from: "start" },
        onComplete: () => {
          gsap.set(grid, { autoAlpha: 0, pointerEvents: "none" });
          resolve();
        },
      });
    });

  useEffect(() => {
    build();
    const onResize = () => build();
    window.addEventListener("resize", onResize);

    if (!window.__TRB_BOUND__) {
      window.__TRB_BOUND__ = true;

      document.addEventListener("astro:before-preparation", (event) => {
        const originalLoader = event.loader;

        event.loader = async () => {
          await cover();
          await originalLoader();
        };
      });

      document.addEventListener("astro:page-load", async () => {
        if (!builtRef.current) return;
        if (!window.__TRB_NEEDS_REVEAL__) return;
        window.__TRB_NEEDS_REVEAL__ = false;
        await reveal();
      });
    }

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <div ref={gridRef} className="trb-grid" aria-hidden="true" />;
}
