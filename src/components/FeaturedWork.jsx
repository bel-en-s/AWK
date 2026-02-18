// src/components/FeaturedWork.jsx
import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./FeaturedWork.css";

gsap.registerPlugin(ScrollTrigger);

const withBase = (p) =>
  `${import.meta.env.BASE_URL}${String(p || "").replace(/^\/+/, "")}`;

const isExternal = (href) => /^https?:\/\//i.test(String(href || ""));

const WORKS = [
  {
    id: "work-1",
    title: "The Perfect Surgery",
    image: "images/workPreview/1.png",
    tags: [
      "Branding",
      "Naming",
      "Web UX/UI",
      "Backend",
      "Documentary",
      "Paid Media",
      "SEO",
      "Content",
      "Mobile First",
    ],
    href: "work",
  },
  {
    id: "work-2",
    title: "CRAFT",
    image: "images/workPreview/2.jpg",
    tags: ["Branding", "Concept", "Retail Branding", "Illustration", "Motion", "Content"],
    href: "work",
  },
  {
    id: "work-3",
    title: "Husqvarna",
    image: "images/workPreview/3.jpg",
    tags: ["Branding", "Concept", "Digital Assets", "Documentary"],
    href: "work",
  },
];

export default function FeaturedWork({
  works = WORKS,
  allWorkHref = "work",
  className = "",
}) {
  const rootRef = useRef(null);
  const allWorkResolved = isExternal(allWorkHref)
    ? allWorkHref
    : withBase(allWorkHref);

  const safeWorks = useMemo(() => {
    const arr = Array.isArray(works) && works.length ? works : WORKS;
    return arr.map((w, i) => ({
      ...w,
      id: w.id || `work-${i + 1}`,
      title: String(w.title || "").trim(),
      image: String(w.image || "").trim(),
      tags: Array.isArray(w.tags) ? w.tags.filter(Boolean).map(String) : [],
      href: String(w.href || "work"),
    }));
  }, [works]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const canHover =
      window.matchMedia?.("(hover: hover)")?.matches &&
      window.matchMedia?.("(pointer: fine)")?.matches;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".awk-work__card");
      const medias = gsap.utils.toArray(".awk-work__media");
      const imgs = gsap.utils.toArray(".awk-work__media img");
      const tagsLists = gsap.utils.toArray(".awk-work__tags");
      const tagItems = gsap.utils.toArray(".awk-work__tag");

      if (!prefersReduced) {
        gsap.set(cards, {
          y: 8,
          autoAlpha: 0,
          rotateX: 6,
          transformPerspective: 900,
          transformOrigin: "50% 65%",
          willChange: "transform, opacity",
        });

        gsap.set(medias, { clipPath: "inset(10% 0% 10% 0%)" });
        gsap.set(imgs, { scale: 1.06, yPercent: 6, transformOrigin: "50% 50%" });
        gsap.set(tagsLists, { y: 10, autoAlpha: 0 });
        gsap.set(tagItems, { y: 6, autoAlpha: 0 });

        cards.forEach((card) => {
          const media = card.querySelector(".awk-work__media");
          const img = card.querySelector(".awk-work__media img");
          const tags = card.querySelector(".awk-work__tags");
          const chips = card.querySelectorAll(".awk-work__tag");

          const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

          tl.to(card, { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.75 }, 0);

          if (media)
            tl.to(media, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.85, ease: "power2.out" }, 0);

          if (img)
            tl.to(img, { scale: 1, yPercent: 0, duration: 0.95, ease: "power2.out" }, 0);

          if (tags) tl.to(tags, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.1);

          if (chips?.length) {
            tl.to(chips, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.04, ease: "power2.out" }, 0.18);
          }

          ScrollTrigger.create({
            trigger: card,
            start: "top 80%",
            onEnter: () => tl.play(0),
            onEnterBack: () => tl.play(0),
          });
        });

        // parallax leve
        imgs.forEach((img) => {
          const media = img.closest(".awk-work__media");
          if (!media) return;
          gsap.to(img, {
            yPercent: -4,
            ease: "none",
            scrollTrigger: {
              trigger: media,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.35,
            },
          });
        });
      } else {
        // reduced motion: dejar todo visible
        gsap.set(cards, { clearProps: "all", autoAlpha: 1 });
        gsap.set(medias, { clearProps: "all" });
        gsap.set(imgs, { clearProps: "all" });
        gsap.set(tagsLists, { clearProps: "all", autoAlpha: 1 });
        gsap.set(tagItems, { clearProps: "all", autoAlpha: 1 });
      }

      // ---------- HOVER: lift + tilt (tipo NavBar) ----------
      if (canHover && !prefersReduced) {
        const cleanups = [];

        cards.forEach((card, idx) => {
          const dir = idx % 2 === 0 ? -1 : 1;
          const MAX_TILT = 7; // grados
          const Z_BASE = dir * 1.5;

          gsap.set(card, {
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            y: 0,
            scale: 1,
            transformPerspective: 900,
            transformOrigin: "50% 60%",
            willChange: "transform",
          });

          let hoverTl = null;

          const enter = () => {
            hoverTl?.kill();
            hoverTl = gsap.timeline({ defaults: { ease: "expo.out" } });
            hoverTl.to(card, { y: -6, scale: 1.02, rotateZ: Z_BASE, duration: 0.35 }, 0);
          };

          const leave = () => {
            hoverTl?.kill();
            hoverTl = null;
            gsap.to(card, {
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
              y: 0,
              scale: 1,
              duration: 0.55,
              ease: "expo.out",
              overwrite: "auto",
            });
          };

          const move = (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width; // 0..1
            const py = (e.clientY - r.top) / r.height; // 0..1
            const rotY = (px - 0.5) * (MAX_TILT * 2);
            const rotX = -(py - 0.5) * (MAX_TILT * 2);

            gsap.to(card, {
              rotateX: rotX,
              rotateY: rotY,
              duration: 0.25,
              ease: "power2.out",
              overwrite: "auto",
            });
          };

          card.addEventListener("pointerenter", enter);
          card.addEventListener("pointerleave", leave);
          card.addEventListener("pointermove", move);
          card.addEventListener("focus", enter);
          card.addEventListener("blur", leave);

          cleanups.push(() => {
            card.removeEventListener("pointerenter", enter);
            card.removeEventListener("pointerleave", leave);
            card.removeEventListener("pointermove", move);
            card.removeEventListener("focus", enter);
            card.removeEventListener("blur", leave);
            hoverTl?.kill();
          });
        });

        return () => cleanups.forEach((fn) => fn());
      }
    }, root);

    return () => ctx.revert();
  }, [safeWorks]);

  return (
    <section
      ref={rootRef}
      className={`awk-works ${className}`}
      aria-label="Works preview"
    >
      <div className="awk-works__inner">
        <div className="awk-works__grid">
          {safeWorks.map((work) => {
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

                  <ul
                    className="awk-work__tags"
                    aria-label={`Tags ${work.title}`}
                  >
                    {work.tags.map((tag) => (
                      <li key={`${work.id}-${tag}`} className="awk-work__tag">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </a>
              </article>
            );
          })}

          <div className="awk-allWorkCell">
            <a
              className="awk-allWork"
              href={allWorkResolved}
              aria-label="All work"
              data-cursor="blue"
            >
              <span className="awk-allWork__label">ALL WORK</span>
              <span className="awk-allWork__circle" aria-hidden="true">
                <span className="awk-allWork__chev">›</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
