import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import "./Work.css";

const PROJECTS = [
  { title: "Motion Clinic", image: "images/portfolio/PORTADAS-01.jpg", category: "Creative Web Design", year: "2025" },
  { title: "Shadowwear 6AM", image: "images/portfolio/PORTADAS-02.jpg", category: "Photography", year: "2024" },
  { title: "Blur Formation 03", image: "images/portfolio/PORTADAS-03.jpg", category: "Kinetic Study", year: "2024" },
  { title: "Sunglass Operator", image: "images/portfolio/PORTADAS-04.jpg", category: "Editorial Motion", year: "2023" },
  { title: "Azure Figure 5", image: "images/portfolio/PORTADAS-05.jpg", category: "Visual Research", year: "2024" },
];

const withBase = (p) => {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "") + "/";
  const clean = String(p || "").replace(/^\/+/, "");
  return (base + clean).replace(/\/{2,}/g, "/");
};

function splitChars(text) {
  return String(text || "").split("").map((ch, i) => ({ ch, key: `w-${i}` }));
}

function whenAwkLoaded(cb) {
  if (typeof window === "undefined") return () => {};
  if (window.__AWK_LOADED__ === true) {
    cb();
    return () => {};
  }
  const on = () => cb();
  window.addEventListener("awk:loaded", on, { once: true });
  return () => window.removeEventListener("awk:loaded", on);
}

export default function Work({ projects = PROJECTS }) {
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("is-nav-blue");
    return () => html.classList.remove("is-nav-blue");
  }, []);

  const data = useMemo(() => {
    const arr = Array.isArray(projects) && projects.length ? projects : PROJECTS;
    return arr.map((p, idx) => ({
      ...p,
      _idx: idx + 1,
      image: String(p.image || "").startsWith("http") ? p.image : withBase(p.image),
    }));
  }, [projects]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const title = titleRef.current;
    const img = previewRef.current;
    if (!root || !title || !img) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const canHover =
      window.matchMedia?.("(hover: hover)")?.matches &&
      window.matchMedia?.("(pointer: fine)")?.matches;

    gsap.set(img, { xPercent: -50, yPercent: -50, autoAlpha: 0 });

    let cleanupHover = () => {};
    if (canHover && !prefersReduced) {
      let firstEnter = false;
      const setX = gsap.quickTo(img, "x", { duration: 0.4, ease: "power3" });
      const setY = gsap.quickTo(img, "y", { duration: 0.4, ease: "power3" });

      const align = (e) => {
        if (firstEnter) {
          setX(e.clientX, e.clientX);
          setY(e.clientY, e.clientY);
          firstEnter = false;
        } else {
          setX(e.clientX);
          setY(e.clientY);
        }
      };

      const startFollow = () => document.addEventListener("mousemove", align);
      const stopFollow = () => document.removeEventListener("mousemove", align);

      const fade = gsap.to(img, {
        autoAlpha: 1,
        ease: "none",
        paused: true,
        duration: 0.1,
        onReverseComplete: stopFollow,
      });

      const items = Array.from(root.querySelectorAll("[data-work-item='true']"));

      const enter = (e) => {
        const el = e.currentTarget;
        const src = el.getAttribute("data-image");
        if (!src) return;
        if (img.getAttribute("src") !== src) img.setAttribute("src", src);

        firstEnter = true;
        fade.play();
        startFollow();
        align(e);
      };

      const leave = () => fade.reverse();

      items.forEach((el) => {
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
      });

      cleanupHover = () => {
        stopFollow();
        fade.kill();
        items.forEach((el) => {
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("mouseleave", leave);
        });
        gsap.killTweensOf(img);
      };
    }

    const run = () => {
      const ctx = gsap.context(() => {
        const chars = Array.from(title.querySelectorAll(".workTitle__char"));
        const items = Array.from(root.querySelectorAll(".workItem"));

        const rows = items
          .map((it) => it.querySelector(".workRow"))
          .filter(Boolean);

        const thumbs = items
          .map((it) => it.querySelector(".workMobileThumb"))
          .filter(Boolean);

        const thumbImgs = items
          .map((it) => it.querySelector(".workMobileThumb img"))
          .filter(Boolean);

        gsap.killTweensOf([chars, items, rows, thumbs, thumbImgs]);

        if (prefersReduced) {
          gsap.set(chars, { yPercent: 0 });
          gsap.set(items, { autoAlpha: 1 });
          gsap.set([rows, thumbs], { y: 0 });
          gsap.set(thumbImgs, { scale: 1 });
          return;
        }

        gsap.set(title, { autoAlpha: 1 });
        gsap.set(chars, { yPercent: 120, willChange: "transform" });

        gsap.set(items, { autoAlpha: 1 });

        const rowOffsets = rows.map((el) => el.offsetHeight + 520);
        const thumbOffsets = thumbs.map((el) => el.offsetHeight + 540);

        gsap.set(rows, {
          y: (i) => rowOffsets[i],
          willChange: "transform",
        });

        gsap.set(thumbs, {
          y: (i) => thumbOffsets[i],
          willChange: "transform",
        });

        gsap.set(thumbImgs, { scale: 1.08, willChange: "transform" });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        tl.to(chars, {
          yPercent: 0,
          duration: 0.25,
          stagger: 0.06,
          onComplete: () => gsap.set(chars, { clearProps: "willChange" }),
        });

        tl.to(
          rows,
          {
            y: 0,
            duration: 0.95,
            stagger: 0.08,
            onComplete: () => gsap.set(rows, { clearProps: "willChange" }),
          },
          "-=0.35"
        );

        tl.to(
          thumbs,
          {
            y: 0,
            duration: 0.95,
            stagger: 0.08,
            onComplete: () => gsap.set(thumbs, { clearProps: "willChange" }),
          },
          "-=0.75"
        );

        tl.to(
          thumbImgs,
          {
            scale: 1,
            duration: 1.05,
            stagger: 0.08,
            onComplete: () => gsap.set(thumbImgs, { clearProps: "willChange" }),
          },
          "<"
        );
      }, root);

      return () => ctx.revert();
    };

    let cleanupRun = () => {};
    const start = () => {
      cleanupRun();
      cleanupRun = run();
    };

    const offLoaded = whenAwkLoaded(start);

    const onSwap = () => start();
    document.addEventListener("astro:after-swap", onSwap);

    return () => {
      offLoaded?.();
      document.removeEventListener("astro:after-swap", onSwap);
      cleanupRun?.();
      cleanupHover?.();
    };
  }, [data]);

  const titleChars = splitChars("WORK");

  return (
    <main ref={rootRef} className="workPage" aria-label="Work">
      <img ref={previewRef} className="workPreview" alt="" />

      <header className="workHeader">
        <h1 ref={titleRef} className="workTitleBig" aria-label="WORK">
          {titleChars.map(({ ch, key }) => {
            const isSpace = ch === " ";
            return (
              <span
                key={key}
                className={`workTitle__charWrap${isSpace ? " is-space" : ""}`}
                aria-hidden="true"
              >
                <span className="workTitle__char">{isSpace ? "\u00A0" : ch}</span>
              </span>
            );
          })}
        </h1>
      </header>

      <ul className="workList" role="list" aria-label="Projects">
        {data.map((p) => (
          <li
            key={`${p.title}-${p._idx}`}
            className="workItem"
            data-work-item="true"
            data-image={p.image}
          >
            <div className="workRow">
              <div className="workLeft">
                <div className="workNum">{String(p._idx).padStart(2, "0")}</div>
                <h3 className="workTitle">{p.title}</h3>
              </div>

              <div className="workRight">
                <div className="workMeta">
                  <span className="workCat">{p.category}</span>
                  <span className="workDot">•</span>
                  <span className="workYear">{p.year}</span>
                </div>
              </div>
            </div>

            <div className="workMobileThumb" aria-hidden="true">
              <img src={p.image} alt="" loading="lazy" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
