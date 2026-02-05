import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./FeaturedWork.css";

gsap.registerPlugin(ScrollTrigger);

const withBase = (p) =>
  `${import.meta.env.BASE_URL}${String(p).replace(/^\/+/, "")}`;
const isExternal = (href) => /^https?:\/\//i.test(String(href));

const WORKS = [
  {
    id: "work-1",
    title: "The Perfect Surgery",
    image: "images/workPreview/1.png",
    tags: ["Branding", "Web", "UI/UX"],
    href: "work",
  },
  {
    id: "work-2",
    title: "CRAFT",
    image: "images/workPreview/2.jpg",
    tags: ["Art Direction", "Motion"],
    href: "work",
  },
  {
    id: "work-3",
    title: "Experiment 03",
    image: "images/workPreview/3.jpg",
    tags: ["Experiment", "Creative Dev"],
    href: "work",
  },
];

export default function WorksPreview({
  works = WORKS,
  allWorkHref = "work",
  className = "",
}) {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const ctx = gsap.context(() => {
      const items = Array.from(root.querySelectorAll(".awk-work"));
      if (!items.length) return;

      const played = new WeakSet();
      let queueDelay = 0;
      let queueRaf = 0;

      const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

      const prime = (el) => {
        const card = el.querySelector(".awk-work__card");
        const media = el.querySelector(".awk-work__media");
        const img = el.querySelector(".awk-work__media img");
        const tags = Array.from(el.querySelectorAll(".awk-work__tag"));

        if (card) {
          gsap.set(card, {
            autoAlpha: 0,
            y: 26,
            rotateX: 10,
            transformPerspective: 900,
            transformOrigin: "50% 70%",
            willChange: "transform, opacity",
          });
        }

        if (media) {
          gsap.set(media, {
            clipPath: "inset(12% 0% 0% 0% round 18px)",
            willChange: "clip-path",
          });
        }

        if (img) {
          gsap.set(img, { scale: 1.06, willChange: "transform" });
        }

        if (tags.length) {
          gsap.set(tags, {
            autoAlpha: 0,
            y: 10,
            filter: "blur(7px)",
            willChange: "transform, opacity, filter",
          });
        }

        return { card, media, img, tags };
      };

      const buildTL = (el, i) => {
        const { card, media, img, tags } = prime(el);

        if (!card) return null;

        const easeCard =
          i % 3 === 0 ? "expo.out" : i % 3 === 1 ? "power3.out" : "power4.out";
        const durCard = i % 3 === 0 ? 0.82 : i % 3 === 1 ? 0.68 : 0.74;
        const durReveal = i % 2 === 0 ? 0.74 : 0.62;
        const durImg = i % 2 === 0 ? 0.96 : 0.84;

        const tl = gsap.timeline({ paused: true });

        tl.to(
          card,
          { autoAlpha: 1, y: 0, rotateX: 0, duration: durCard, ease: easeCard },
          0
        );

        if (media) {
          tl.to(
            media,
            {
              clipPath: "inset(0% 0% 0% 0% round 18px)",
              duration: durReveal,
              ease: "power3.out",
            },
            0
          );
        }

        if (img) {
          tl.to(img, { scale: 1, duration: durImg, ease: "expo.out" }, 0);
        }

        if (tags?.length) {
          tl.to(
            tags,
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.44,
              ease: "power3.out",
              stagger: 0.055,
              onComplete: () => gsap.set(tags, { clearProps: "filter" }),
            },
            0.18 + (i % 3) * 0.04
          );
        }

        return tl;
      };

      const tls = items.map((el, i) => buildTL(el, i));

      if (prefersReduced) {
        items.forEach((el) => {
          const card = el.querySelector(".awk-work__card");
          const media = el.querySelector(".awk-work__media");
          const img = el.querySelector(".awk-work__media img");
          const tags = Array.from(el.querySelectorAll(".awk-work__tag"));

          if (card) gsap.set(card, { autoAlpha: 1, y: 0, rotateX: 0 });
          if (media) gsap.set(media, { clipPath: "inset(0% 0% 0% 0% round 18px)" });
          if (img) gsap.set(img, { scale: 1 });
          if (tags.length) gsap.set(tags, { autoAlpha: 1, y: 0, filter: "none" });
        });
        return;
      }

      const schedulePlay = (el, i) => {
        if (played.has(el)) return;
        const tl = tls[i];
        if (!tl) return;

        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const t = clamp((rect.top - vh * 0.55) / (vh * 0.45), 0, 1);
        const baseGap = 0.14;
        const extra = 0.08 * (i % 2) + 0.05 * (i % 3) + 0.10 * t;

        const delay = queueDelay + extra;

        gsap.delayedCall(delay, () => {
          if (played.has(el)) return;
          played.add(el);
          tl.play(0);
        });

        queueDelay = delay + baseGap;
        cancelAnimationFrame(queueRaf);
        queueRaf = requestAnimationFrame(() => {
          queueDelay = 0;
        });
      };

      ScrollTrigger.batch(items, {
        start: "top 86%",
        once: true,
        onEnter: (batch) => {
          batch
            .slice()
            .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
            .forEach((el) => {
              const i = items.indexOf(el);
              if (i >= 0) schedulePlay(el, i);
            });
        },
      });

      const r = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(r);
    }, root);

    return () => ctx.revert();
  }, []);

  const allWorkResolved = isExternal(allWorkHref)
    ? allWorkHref
    : withBase(allWorkHref);

  return (
    <section
      ref={rootRef}
      className={`awk-works ${className}`}
      aria-label="Works preview"
    >
      <div className="awk-works__inner">
        <div className="awk-works__grid">
          {works.map((work) => {
            const hrefResolved = isExternal(work.href)
              ? work.href
              : withBase(work.href);

            return (
              <article key={work.id} className="awk-work">
                <a
                  className="awk-work__card"
                  href={hrefResolved}
                  aria-label={work.title}
                  data-cursor="blue"
                >
                  <div className="awk-work__media">
                    <img src={withBase(work.image)} alt="" loading="lazy" />
                    <span className="awk-work__arrowBtn" aria-hidden="true">
                      <span className="awk-work__arrowIco">›</span>
                    </span>
                  </div>

                  <ul className="awk-work__tags" aria-label="Tags">
                    {work.tags.map((tag) => (
                      <li key={tag} className="awk-work__tag">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </a>
              </article>
            );
          })}
        </div>

        <div className="awk-works__footer">
          <a
            className="awk-allWork"
            href={allWorkResolved}
            aria-label="All work"
            data-cursor="blue"
          >
            <span className="awk-allWork__label">SEE ALL WORK</span>
            <span className="awk-allWork__circle" aria-hidden="true">
              <span className="awk-allWork__chev">›</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
