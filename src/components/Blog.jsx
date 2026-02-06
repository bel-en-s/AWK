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
    image: "/images/blog/1.webp",
    href: "#",
  },
  leftBottom: {
    title: "Cómo la IA está\ntransformando el Marketing\ny la Publicidad?",
    image: "/images/blog/1.webp",
    href: "#",
  },
  rightTop: {
    title:
      "IDNTITY / Sebastián Linck\ny Diego Cuervo: Creando\nel Uber de la agencia de\nmedios",
    image: "/images/blog/1.webp",
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
          gsap.set(chars, { yPercent: 0 });
          gsap.set(cards, { autoAlpha: 1 });
          gsap.set([medias, bodies], { y: 0 });
          gsap.set(imgs, { scale: 1 });
          return;
        }

        gsap.set(title, { autoAlpha: 1 });
        gsap.set(chars, { yPercent: 120, willChange: "transform" });
        gsap.set(cards, { autoAlpha: 1 });

        const mediaOffsets = medias.map((el) => el.offsetHeight + 140);
        const bodyOffsets = bodies.map((el) => el.offsetHeight + 120);

        gsap.set(medias, {
          y: (i) => mediaOffsets[i],
          willChange: "transform",
        });

        gsap.set(bodies, {
          y: (i) => bodyOffsets[i],
          willChange: "transform",
        });

        gsap.set(imgs, { scale: 1.08, willChange: "transform" });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        tl.to(chars, {
          yPercent: 0,
          duration: 0.85,
          stagger: 0.06,
          onComplete: () => gsap.set(chars, { clearProps: "willChange" }),
        });

        tl.to(
          medias,
          {
            y: 0,
            duration: 0.95,
            stagger: 0.08,
            ease: "expo.out",
            onComplete: () => gsap.set(medias, { clearProps: "willChange" }),
          },
          "-=0.35"
        );

        tl.to(
          imgs,
          {
            scale: 1,
            duration: 1.05,
            stagger: 0.08,
            ease: "expo.out",
            onComplete: () => gsap.set(imgs, { clearProps: "willChange" }),
          },
          "<"
        );

        tl.to(
          bodies,
          {
            y: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: "expo.out",
            onComplete: () => gsap.set(bodies, { clearProps: "willChange" }),
          },
          "-=0.7"
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
                <span className="blogTitle__char">{isSpace ? "\u00A0" : ch}</span>
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
