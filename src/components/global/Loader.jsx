import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./Loader.css";

import loaderDesktop from "../../assets/loader.mp4";
import loaderMobile from "../../assets/loader-mobile.mp4";

const HERO_BOOT_KEY = "AWK_HERO_BOOTED";
const AWK_NAV_KIND = "AWK_NAV_KIND";

function isHeroRoute() {
  if (typeof window === "undefined") return true;
  const p = (window.location.pathname || "/").replace(/\/+$/, "");
  return p === "" || p === "/" || p === "/AWK";
}

function navType() {
  try {
    const e = performance.getEntriesByType?.("navigation")?.[0];
    return e?.type || "navigate";
  } catch (_) {
    return "navigate";
  }
}

export default function Loader() {
  const rootRef = useRef(null);
  const videoRef = useRef(null);
  const [done, setDone] = useState(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;

    const html = document.documentElement;
    const body = document.body;

    const cleanupUnlock = () => {
      html.classList.remove("is-scroll-locked");
      body.classList.remove("is-scroll-locked");
      body.style.overflow = "";
      body.style.touchAction = "";
    };

    const finish = () => {
      gsap.to(root, {
        autoAlpha: 0,
        duration: 0.2,
        onComplete: () => {
          cleanupUnlock();
          setDone(true);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              window.__AWK_LOADED__ = true;
              try {
                window.ScrollTrigger?.refresh?.(true);
              } catch (_) {}
              window.dispatchEvent(new CustomEvent("awk:loaded"));
            });
          });
        },
      });
    };

    const navKind = sessionStorage.getItem(AWK_NAV_KIND) || "hard";
    const alreadyBooted = !!sessionStorage.getItem(HERO_BOOT_KEY);
    const type = navType();
    const isReload = type === "reload";

    const shouldRun =
      isHeroRoute() &&
      navKind !== "spa" &&
      (isReload || !alreadyBooted);

    gsap.set(root, { autoAlpha: 1, pointerEvents: "all" });

    if (!shouldRun) {
      finish();
      return;
    }

    sessionStorage.setItem(HERO_BOOT_KEY, "1");
    sessionStorage.setItem(AWK_NAV_KIND, "hard");
    window.__AWK_LOADED__ = false;

    html.classList.add("is-scroll-locked");
    body.classList.add("is-scroll-locked");
    body.style.overflow = "hidden";
    body.style.touchAction = "none";

    const handleEnd = () => {
      finish();
    };

    video.addEventListener("ended", handleEnd);

    video.play().catch(() => {
      finish();
    });

    return () => {
      video.removeEventListener("ended", handleEnd);
      cleanupUnlock();
    };
  }, []);

  if (done) return null;

  return (
    <div ref={rootRef} className="loader">
      <video
        ref={videoRef}
        className="loader__video"
        autoPlay
        muted
        playsInline
        preload="auto"
      >
        <source src={loaderDesktop} media="(min-width:768px)" type="video/mp4" />
        <source src={loaderMobile} media="(max-width:767px)" type="video/mp4" />
      </video>
    </div>
  );
}