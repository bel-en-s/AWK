import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Footer.css";

gsap.registerPlugin(ScrollTrigger);

const BG_MAP = {
  light: "transparent",
  dark: "#121212",
};

const withBase = (p) =>
  `${import.meta.env.BASE_URL}${String(p || "").replace(/^\/+/, "")}`;

export default function Footer({ bg = "light" }) {
  const resolvedBg = BG_MAP[bg] ?? BG_MAP.light;

  const footerRef = useRef(null);
  const gifRef = useRef(null);

  const gifSrc = useMemo(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      return withBase(
        isMobile ? "images/footer-mobile.gif" : "images/footer.gif"
      );
    }
    return withBase("images/footer.gif");
  }, []);

  useLayoutEffect(() => {
    const root = footerRef.current;
    const gif = gifRef.current;
    if (!root || !gif) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set(gif, { clearProps: "all" });
        return;
      }

      gsap.set(gif, {
        autoAlpha: 0,
        y: -18,
        scale: 0.995,
        filter: "blur(6px)",
        transformOrigin: "50% 50%",
        willChange: "transform,opacity,filter",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 92%",
          end: "top 55%",
          scrub: 0.7,
        },
      });

      tl.to(gif, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`awakeFooter awakeFooter--${bg}`}
      style={{ ["--footer-bg"]: resolvedBg }}
      role="contentinfo"
    >
      <div className="awakeFooter__inner">
        <div className="awakeFooter__hero" aria-label="Stay Awake">
          <picture>
            <source
              media="(max-width: 768px)"
              srcSet={withBase("images/footer-mobile.gif")}
            />
            <img
              ref={gifRef}
              className="awakeFooter__heroGif"
              src={withBase("images/footer.gif")}
              alt="Stay Awake"
              loading="eager"
              decoding="async"
            />
          </picture>
        </div>

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