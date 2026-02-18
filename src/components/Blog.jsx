// Blog.jsx
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./Blog.css";

const BASE = import.meta.env.BASE_URL;
const FALLBACK_IMG = "/images/blog/1.webp";

const withBase = (p) => {
  const base = BASE.endsWith("/") ? BASE : `${BASE}/`;
  const cleanPath = String(p || "").replace(/^\//, "");
  return `${base}${cleanPath}`;
};

const POSTS = {
  leftTop: {
    title: "La guerra de los clicks:\nQué cambió en la\npublicidad con el análisis\nde datos",
    image: "/images/blog/NEWS-03.png",
    href: "#",
  },
  leftBottom: {
    title: "Cómo la IA está\ntransformando el Marketing\ny la Publicidad?",
    image: "/images/blog/NEWS-02.png",
    href: "#",
  },
  rightTop: {
    title:
      "IDNTITY / Sebastián Linck\ny Diego Cuervo: Creando\nel Uber de la agencia de\nmedios",
    image: "/images/blog/NEWS-05.png",
    href: "#",
  },
  rightBottom: {
    title: "A digital-first studio\namong U.S. Latino\nAgencies",
    image: "/images/blog/2.jpg",
    href: "#",
  },
};

function ArrowBadge() {
  return (
    <span className="blogArrow" aria-hidden="true">
      ↗
    </span>
  );
}

function PostCard({ variant = "vertical", title, image, href = "#" }) {
  return (
    <a className={`blogCard blogCard--${variant}`} href={href}>
      <div className="blogCard__media">
        <img
          src={withBase(image)}
          alt=""
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.fallbackApplied) return;
            img.dataset.fallbackApplied = "1";
            img.src = withBase(FALLBACK_IMG);
          }}
        />
      </div>

      <div className="blogCard__body">
        <p className="blogCard__title">{title}</p>
        <ArrowBadge />
      </div>
    </a>
  );
}

function splitChars(text) {
  return String(text || "").split("").map((ch, i) => ({ ch, key: `c-${i}` }));
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

export default function Blog() {
  const rootRef = useRef(null);
  const titleRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const title = titleRef.current;
    if (!root || !title) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const run = () => {
      const ctx = gsap.context(() => {
        const chars = Array.from(title.querySelectorAll(".blogTitle__char"));
        const cards = Array.from(root.querySelectorAll(".blogCard"));

        const medias = cards
          .map((c) => c.querySelector(".blogCard__media"))
          .filter(Boolean);
        const bodies = cards
          .map((c) => c.querySelector(".blogCard__body"))
          .filter(Boolean);
        const imgs = cards
          .map((c) => c.querySelector(".blogCard__media img"))
          .filter(Boolean);

        gsap.killTweensOf([chars, cards, medias, bodies, imgs]);

        if (prefersReduced) {
          gsap.set(title, { autoAlpha: 1 });
          gsap.set(chars, { yPercent: 0, clearProps: "willChange" });
          gsap.set(cards, { autoAlpha: 1, y: 0 });
          gsap.set([medias, bodies], { y: 0 });
          gsap.set(imgs, { scale: 1 });
          return;
        }

        gsap.set(title, { autoAlpha: 1 });

        // Title: entra de abajo
        gsap.set(chars, { yPercent: 140, willChange: "transform" });

        // Cards: IMPORTANTÍSIMO -> arrancan ocultas para que no se vean "ahí" antes de subir
        gsap.set(cards, { autoAlpha: 0 });

        // Offsets más grandes (mezcla elemento + viewport) para que arranquen más abajo
        const vh = window.innerHeight || 800;
        const mediaOffsets = medias.map((el) =>
          Math.max(el.offsetHeight + 220, vh * 0.45)
        );
        const bodyOffsets = bodies.map((el) =>
          Math.max(el.offsetHeight + 200, vh * 0.38)
        );

        gsap.set(medias, {
          y: (i) => mediaOffsets[i],
          willChange: "transform",
        });

        gsap.set(bodies, {
          y: (i) => bodyOffsets[i],
          willChange: "transform",
        });

        gsap.set(imgs, { scale: 1.1, willChange: "transform" });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        // Prender cards al inicio de la animación (así no se ven antes)
        tl.set(cards, { autoAlpha: 1 }, 0);

        tl.to(chars, {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.06,
          onComplete: () => gsap.set(chars, { clearProps: "willChange" }),
        });

        tl.to(
          medias,
          {
            y: 0,
            duration: 1.1,
            stagger: 0.09,
            ease: "expo.out",
            onComplete: () => gsap.set(medias, { clearProps: "willChange" }),
          },
          "-=0.35"
        );

        tl.to(
          imgs,
          {
            scale: 1,
            duration: 1.15,
            stagger: 0.09,
            ease: "expo.out",
            onComplete: () => gsap.set(imgs, { clearProps: "willChange" }),
          },
          "<"
        );

        tl.to(
          bodies,
          {
            y: 0,
            duration: 1.0,
            stagger: 0.09,
            ease: "expo.out",
            onComplete: () => gsap.set(bodies, { clearProps: "willChange" }),
          },
          "-=0.85"
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
    };
  }, []);

  const chars = splitChars("NEWS");

  return (
    <section ref={rootRef} className="blogSection" id="blog">
      <div className="blogWrap">
        <h2 ref={titleRef} className="blogTitle" aria-label="NEWS">
          {chars.map(({ ch, key }) => {
            const isSpace = ch === " ";
            return (
              <span
                key={key}
                className={`blogTitle__charWrap${isSpace ? " is-space" : ""}`}
                aria-hidden="true"
              >
                <span className="blogTitle__char">
                  {isSpace ? "\u00A0" : ch}
                </span>
              </span>
            );
          })}
        </h2>

        <div className="blogGrid">
          <div className="blogCol blogCol--left">
            <PostCard variant="vertical" {...POSTS.leftTop} />
            <PostCard variant="vertical" {...POSTS.leftBottom} />
          </div>

          <div className="blogCol blogCol--right">
            <PostCard variant="vertical" {...POSTS.rightTop} />
            <PostCard variant="vertical" {...POSTS.rightBottom} />
          </div>
        </div>
      </div>
    </section>
  );
}
