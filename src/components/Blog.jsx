import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Blog.css";

gsap.registerPlugin(ScrollTrigger);

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

function splitWords(text) {
  const safe = String(text || "");
  const tokens = safe.replace(/\n/g, " \n ").split(/(\s+)/).filter((t) => t.length);
  const out = [];
  let wi = 0;
  for (const t of tokens) {
    if (t === "\n") {
      out.push({ type: "br", key: `br-${wi++}` });
    } else if (/^\s+$/.test(t)) {
      out.push({ type: "space", value: t, key: `sp-${wi++}` });
    } else {
      out.push({ type: "word", value: t, key: `w-${wi++}` });
    }
  }
  return out;
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

    const ctx = gsap.context(() => {
      const words = Array.from(title.querySelectorAll(".blogTitle__word"));
      if (!words.length) return;

      if (prefersReduced) {
        gsap.set(words, { autoAlpha: 1, y: 0, rotateX: 0, filter: "none" });
        return;
      }

      gsap.set(words, {
        autoAlpha: 0,
        y: -90,
        rotateX: 65,
        filter: "blur(12px)",
        transformPerspective: 1000,
        transformOrigin: "50% 70%",
        willChange: "transform, opacity, filter",
      });

      gsap.to(words, {
        autoAlpha: 1,
        y: 0,
        rotateX: 0,
        filter: "blur(0px)",
        ease: "none",
        stagger: { each: 0.08, from: "start" },
        scrollTrigger: {
          id: "BLOG_NEWS_WORDS",
          trigger: root,
          start: "top 88%",
          end: "top 55%",
          scrub: 0.9,
          once: true,
          invalidateOnRefresh: true,
        },
        onComplete: () => gsap.set(words, { clearProps: "filter" }),
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const titleTokens = splitWords("NEWS");

  return (
    <section ref={rootRef} className="blogSection" id="blog">
      <div className="blogWrap">
        <h2 ref={titleRef} className="blogTitle" aria-label="NEWS">
          {titleTokens.map((t) => {
            if (t.type === "br") return <br key={t.key} />;
            if (t.type === "space") return <span key={t.key}>{t.value}</span>;
            return (
              <span key={t.key} className="blogTitle__word">
                {t.value}
              </span>
            );
          })}
        </h2>

        <div className="blogGrid">
          <div className="blogCol blogCol--left">
            <PostCard
              variant="vertical"
              title={POSTS.leftTop.title}
              image={POSTS.leftTop.image}
              href={POSTS.leftTop.href}
            />
            <PostCard
              variant="vertical"
              title={POSTS.leftBottom.title}
              image={POSTS.leftBottom.image}
              href={POSTS.leftBottom.href}
            />
          </div>

          <div className="blogCol blogCol--right">
            <PostCard
              variant="vertical"
              title={POSTS.rightTop.title}
              image={POSTS.rightTop.image}
              href={POSTS.rightTop.href}
            />
            <PostCard
              variant="vertical"
              title={POSTS.rightBottom.title}
              image={POSTS.rightBottom.image}
              href={POSTS.rightBottom.href}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
