// src/components/FeaturedWork.jsx
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./FeaturedWork.css";

const withBase = (p) =>
  `${import.meta.env.BASE_URL}${String(p || "").replace(/^\/+/, "")}`;
const isExternal = (href) => /^https?:\/\//i.test(String(href || ""));

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

export default function FeaturedWork({
  works = WORKS,
  allWorkHref = "work",
  className = "",
}) {
  const rootRef = useRef(null);
  const allWorkResolved = isExternal(allWorkHref) ? allWorkHref : withBase(allWorkHref);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    const items = Array.from(root.querySelectorAll(".awk-work"));

    const setOut = () => {
      items.forEach((el) => {
        const media = el.querySelector(".awk-work__media");
        const img = el.querySelector(".awk-work__media img");
        const tags = el.querySelector(".awk-work__tags");

        gsap.killTweensOf([el, media, img, tags].filter(Boolean));

        gsap.set(el, {
          y: 42,
          rotateX: 10,
          transformPerspective: 900,
          transformOrigin: "50% 60%",
          filter: "blur(6px)",
          autoAlpha: 0,
        });

        if (media) gsap.set(media, { y: 18, autoAlpha: 0 });
        if (img) gsap.set(img, { scale: 1.09 });
        if (tags) gsap.set(tags, { y: 14, autoAlpha: 0 });
      });
    };

    const playIn = () => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.to(items, {
        autoAlpha: 1,
        y: 0,
        rotateX: 0,
        filter: "blur(0px)",
        duration: 0.95,
        stagger: 0.12,
        overwrite: "auto",
        clearProps: "transform,filter,opacity,visibility",
      }, 0);

      items.forEach((el, i) => {
        const media = el.querySelector(".awk-work__media");
        const img = el.querySelector(".awk-work__media img");
        const tags = el.querySelector(".awk-work__tags");

        if (media) {
          tl.to(
            media,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.85,
              overwrite: "auto",
              clearProps: "transform,opacity,visibility",
            },
            0.08 + i * 0.12
          );
        }

        if (img) {
          tl.to(
            img,
            {
              scale: 1,
              duration: 1.15,
              ease: "expo.out",
              overwrite: "auto",
              clearProps: "transform",
            },
            0.06 + i * 0.12
          );
        }

        if (tags) {
          tl.to(
            tags,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.75,
              overwrite: "auto",
              clearProps: "transform,opacity,visibility",
            },
            0.18 + i * 0.12
          );
        }
      });

      return tl;
    };

    const playOut = () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

      tl.to(items, {
        autoAlpha: 0,
        y: 42,
        rotateX: 10,
        filter: "blur(6px)",
        duration: 0.35,
        stagger: 0.06,
        overwrite: "auto",
      }, 0);

      items.forEach((el) => {
        const media = el.querySelector(".awk-work__media");
        const img = el.querySelector(".awk-work__media img");
        const tags = el.querySelector(".awk-work__tags");

        if (media) gsap.to(media, { autoAlpha: 0, y: 18, duration: 0.28, overwrite: "auto" });
        if (img) gsap.to(img, { scale: 1.09, duration: 0.35, overwrite: "auto" });
        if (tags) gsap.to(tags, { autoAlpha: 0, y: 14, duration: 0.28, overwrite: "auto" });
      });

      return tl;
    };

    setOut();

    let inTl = null;
    let outTl = null;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          outTl?.kill();
          outTl = null;
          inTl?.kill();
          inTl = playIn();
        } else {
          inTl?.kill();
          inTl = null;
          outTl?.kill();
          outTl = playOut();
        }
      },
      { root: null, threshold: 0.22, rootMargin: "0px 0px -12% 0px" }
    );

    io.observe(root);

    return () => {
      inTl?.kill();
      outTl?.kill();
      io.disconnect();
    };
  }, [works]);

  return (
    <section ref={rootRef} className={`awk-works ${className}`} aria-label="Works preview">
      <div className="awk-works__inner">
        <div className="awk-works__grid">
          {works.map((work) => {
            const hrefResolved = isExternal(work.href) ? work.href : withBase(work.href);

            return (
              <article key={work.id} className="awk-work">
                <a className="awk-work__card" href={hrefResolved} aria-label={work.title} data-cursor="blue">
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
          <a className="awk-allWork" href={allWorkResolved} aria-label="All work" data-cursor="blue">
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
