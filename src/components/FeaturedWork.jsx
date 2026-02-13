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
      "Web Front",
      "UX/UI & Backend",
      "Documental",
      "Paid Media + SEO",
      "Content AO",
      "Mobile First",
    ],
    href: "work",
  },
  {
    id: "work-2",
    title: "CRAFT",
    image: "images/workPreview/2.jpg",
    tags: ["Branding", "Concept", "Content AO", "Retail Branding", "Illustration", "Motion"],
    href: "work",
  },
  {
    id: "work-3",
    title: "Husqvarna",
    image: "images/workPreview/3.jpg",
    tags: ["Branding", "Concept + Idea", "Digital Assets", "Documental"],
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

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".awk-work__card");
      const medias = gsap.utils.toArray(".awk-work__media");
      const imgs = gsap.utils.toArray(".awk-work__media img");
      const tagsLists = gsap.utils.toArray(".awk-work__tags");
      const tagItems = gsap.utils.toArray(".awk-work__tag");

      // estado inicial sutil
      gsap.set(cards, {
        y: 18,
        autoAlpha: 0,
        rotateX: 6,
        transformPerspective: 900,
        transformOrigin: "50% 65%",
      });

      gsap.set(medias, { clipPath: "inset(10% 0% 10% 0%)" });
      gsap.set(imgs, { scale: 1.06, yPercent: 6, transformOrigin: "50% 50%" });
      gsap.set(tagsLists, { y: 10, autoAlpha: 0 });
      gsap.set(tagItems, { y: 6, autoAlpha: 0 });

      // entrada integrada (one-shot trigger + stagger)
      const master = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

      cards.forEach((card, i) => {
        const media = card.querySelector(".awk-work__media");
        const img = card.querySelector(".awk-work__media img");
        const tags = card.querySelector(".awk-work__tags");
        const chips = card.querySelectorAll(".awk-work__tag");

        const tl = gsap.timeline();

        tl.to(card, { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.75 }, 0);

        if (media) tl.to(media, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.85, ease: "power2.out" }, 0);
        if (img) tl.to(img, { scale: 1, yPercent: 0, duration: 0.95, ease: "power2.out" }, 0);

        if (tags) tl.to(tags, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.1);

        if (chips?.length) {
          tl.to(chips, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.04, ease: "power2.out" }, 0.18);
        }

        master.add(tl, i * 0.14);
      });

      const st = ScrollTrigger.create({
        trigger: root,
        start: "top 75%",
        onEnter: () => master.play(0),
        onEnterBack: () => master.play(0),
      });

      // parallax muy leve
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

      return () => {
        st.kill();
        master.kill();
        ScrollTrigger.getAll().forEach((t) => {
          // no mato todo global, solo lo de este ctx (ctx.revert ya lo limpia)
        });
      };
    }, root);

    return () => ctx.revert();
  }, [safeWorks]);

  return (
    <section ref={rootRef} className={`awk-works ${className}`} aria-label="Works preview">
      <div className="awk-works__inner">
        <div className="awk-works__grid">
          {safeWorks.map((work) => {
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

                  <ul className="awk-work__tags" aria-label={`Tags ${work.title}`}>
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

          {/* ✅ AHORA ES UN ITEM DEL GRID (debajo de CRAFT, col 2) */}
          <div className="awk-allWorkCell">
            <a className="awk-allWork" href={allWorkResolved} aria-label="All work" data-cursor="blue">
              <span className="awk-allWork__label">SEE ALL WORK</span>
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
