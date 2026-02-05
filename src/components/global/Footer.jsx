
import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Footer.css";

gsap.registerPlugin(ScrollTrigger);

const BG_MAP = {
  light: "#EBE8E3",
  blue: "#0000fe",
};

export default function Footer({ bg = "light" }) {
  const resolvedBg = BG_MAP[bg] ?? BG_MAP.light;

  const footerRef = useRef(null);
  const titleRef = useRef(null);
  const WORDS = useMemo(() => ["STAY", "AWAKE"], []);

  useLayoutEffect(() => {
    const root = footerRef.current;
    const title = titleRef.current;
    if (!root || !title) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const ctx = gsap.context(() => {
      const letters = Array.from(title.querySelectorAll(".awakeFooter__letter"));
      if (!letters.length) return;

      if (prefersReduced) {
        gsap.set(letters, { autoAlpha: 1, y: 0, rotateX: 0, filter: "none" });
        return;
      }

      gsap.set(letters, {
        autoAlpha: 0,
        y: -120,
        rotateX: 70,
        filter: "blur(14px)",
        transformPerspective: 1000,
        transformOrigin: "50% 60%",
        willChange: "transform, opacity, filter",
      });

      gsap.to(letters, {
        autoAlpha: 1,
        y: 0,
        rotateX: 0,
        filter: "blur(0px)",
        stagger: { each: 0.06, from: "start" },
        ease: "none",
        scrollTrigger: {
          id: "FOOTER_STAYAWAKE_SCRUB",
          trigger: root,
          start: "top 92%",
          end: "top 55%",
          scrub: 0.9,
          invalidateOnRefresh: true,
        },
        onComplete: () => gsap.set(letters, { clearProps: "filter" }),
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const renderWord = (word) => (
    <span className="awakeFooter__word" aria-hidden="true">
      {word.split("").map((ch, i) => (
        <span key={`${word}-${i}`} className="awakeFooter__letter">
          {ch}
        </span>
      ))}
    </span>
  );

  return (
    <footer
      ref={footerRef}
      className={`awakeFooter awakeFooter--${bg}`}
      style={{ ["--footer-bg"]: resolvedBg }}
      role="contentinfo"
    >
      <div className="awakeFooter__inner">
        <h2 ref={titleRef} className="awakeFooter__title" aria-label="Stay Awake">
          {renderWord(WORDS[0])}
          {renderWord(WORDS[1])}
        </h2>

        <div className="awakeFooter__bottom">
          <div className="awakeFooter__col awakeFooter__col--left">
            <div className="awakeFooter__block">
              <div className="awakeFooter__head">Miami</div>
              <div className="awakeFooter__line">401 69st, Miami Beach</div>
              <div className="awakeFooter__line">ZC 33141</div>
            </div>
          </div>

          <div className="awakeFooter__col awakeFooter__col--mid">
            <div className="awakeFooter__block awakeFooter__block--center">
              <a className="awakeFooter__link" href="mailto:stayawake@awk.agency">
                stayawake@awk.agency
              </a>
              <a className="awakeFooter__link" href="tel:+13059034659">
                (+1) 305 903 4659
              </a>
              <a className="awakeFooter__link" href="tel:+541168563765">
                (+54) 11 6856 3765
              </a>
            </div>
          </div>

          <div className="awakeFooter__col awakeFooter__col--right">
            <div className="awakeFooter__block awakeFooter__block--right">
              <div className="awakeFooter__head">Buenos Aires</div>
              <div className="awakeFooter__line">3 de febrero 2340,</div>
              <div className="awakeFooter__line">2nd floor. ZC 1428</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

