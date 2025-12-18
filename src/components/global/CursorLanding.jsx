import { useEffect, useRef } from "react";

export default function CursorLanding({
  cursorSrc = `${import.meta.env.BASE_URL}images/cursor.svg`,
  eyesSrc = `${import.meta.env.BASE_URL}images/ojos.svg`,
  trailSrc = `${import.meta.env.BASE_URL}images/trail.svg`,

  cursorSize = 42,
  eyesSize = 140,

  trailSize = 130,
  trailScale = 1,

  cursorAnchor = { x: 0.5, y: 0.5 },
  eyesAnchor = { x: 0.5, y: 0.5 },
  trailAnchor = { x: 0.5, y: 0.5 },

  cursorLerp = 0.13,
  eyesLerp = 0.022,

  eyesOffsetPx = 220,
  eyesOffsetClamp = 300,

  trailEveryMs = 28,
  trailGapPx = 54,
  trailDuration = 1.6,
  trailOpacity = 0.75,

  dirSmooth = 0.12,
  minDirSpeed = 0.12,

  zIndex = 2147483647,

  enabled = true,
  disableOnTouch = true,

  cursorOpacity = 1,
  eyesOpacity = 1,
}) {
  const rafRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    if (disableOnTouch) {
      const isTouch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia?.("(pointer: coarse)")?.matches;
      if (isTouch) return;
    }

    let gsap = null;
    let stopped = false;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const cursor = { x: mouse.x, y: mouse.y };
    const eyes = { x: mouse.x, y: mouse.y };

    const prevEyes = { x: eyes.x, y: eyes.y };
    const dir = { x: 1, y: 0 };

    const lerp = (a, b, n) => (1 - n) * a + n * b;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    const handleMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    let overlay = null;
    let cursorEl = null;
    let eyesEl = null;

    const createOverlay = () => {
      overlay = document.createElement("div");
      overlay.className = "cursor-landing-overlay";
      Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        pointerEvents: "none",
        overflow: "visible",
        zIndex: String(zIndex),
        isolation: "isolate",
      });
      document.documentElement.appendChild(overlay);
      overlayRef.current = overlay;
    };

    const createCursor = () => {
      cursorEl = document.createElement("img");
      cursorEl.src = cursorSrc;

      Object.assign(cursorEl.style, {
        position: "absolute",
        left: "0px",
        top: "0px",
        width: `${cursorSize}px`,
        height: `${cursorSize}px`,
        userSelect: "none",
        pointerEvents: "none",
        willChange: "transform, opacity",
        opacity: String(cursorOpacity),
        zIndex: "3",
        transform: "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
      });

      overlay.appendChild(cursorEl);
    };

    const createEyes = () => {
      eyesEl = document.createElement("img");
      eyesEl.src = eyesSrc;

      Object.assign(eyesEl.style, {
        position: "absolute",
        left: "0px",
        top: "0px",
        width: `${eyesSize}px`,
        height: `${eyesSize}px`,
        userSelect: "none",
        pointerEvents: "none",
        willChange: "transform, opacity",
        opacity: String(eyesOpacity),
        zIndex: "2",
        transform: "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
      });

      overlay.appendChild(eyesEl);
    };

    const makeTrail = (x, y) => {
      const img = document.createElement("img");
      img.src = trailSrc;

      Object.assign(img.style, {
        position: "absolute",
        left: "0px",
        top: "0px",
        width: `${trailSize}px`,
        height: `${trailSize}px`,
        pointerEvents: "none",
        userSelect: "none",
        willChange: "transform, opacity",
        opacity: String(trailOpacity),
        zIndex: "1",
        backfaceVisibility: "hidden",
      });

      const tx = x - trailSize * trailAnchor.x;
      const ty = y - trailSize * trailAnchor.y;
      img.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${trailScale})`;

      if (eyesEl && eyesEl.parentNode === overlay) overlay.insertBefore(img, eyesEl);
      else overlay.appendChild(img);

      gsap.to(img, {
        opacity: 0,
        duration: trailDuration,
        ease: "power2.out",
        onComplete: () => img.remove(),
      });
    };

    const start = async () => {
      const mod = await import("gsap");
      gsap = mod.gsap;

      createOverlay();
      createEyes();
    

      window.addEventListener("pointermove", handleMove, { passive: true });

      let lastStamp = 0;

      const animate = (t = performance.now()) => {
        if (stopped) return;

        cursor.x = lerp(cursor.x, mouse.x, cursorLerp);
        cursor.y = lerp(cursor.y, mouse.y, cursorLerp);

        const vxe = eyes.x - prevEyes.x;
        const vye = eyes.y - prevEyes.y;
        const spe = Math.hypot(vxe, vye) || 0;

        if (spe > minDirSpeed) {
          const nx = vxe / spe;
          const ny = vye / spe;
          dir.x = lerp(dir.x, nx, dirSmooth);
          dir.y = lerp(dir.y, ny, dirSmooth);
          const dl = Math.hypot(dir.x, dir.y) || 1;
          dir.x /= dl;
          dir.y /= dl;
        }

        const spCursor = Math.hypot(cursor.x - mouse.x, cursor.y - mouse.y);
        const extra = clamp(spCursor * 0.28, 0, eyesOffsetClamp);
        const dist = eyesOffsetPx + extra;

        const targetEyesX = cursor.x - dir.x * dist;
        const targetEyesY = cursor.y - dir.y * dist;

        eyes.x = lerp(eyes.x, targetEyesX, eyesLerp);
        eyes.y = lerp(eyes.y, targetEyesY, eyesLerp);

        const cx = cursor.x - cursorSize * cursorAnchor.x;
        const cy = cursor.y - cursorSize * cursorAnchor.y;
        if (cursorEl) cursorEl.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;

        const ex = eyes.x - eyesSize * eyesAnchor.x;
        const ey = eyes.y - eyesSize * eyesAnchor.y;
        if (eyesEl) eyesEl.style.transform = `translate3d(${ex}px, ${ey}px, 0)`;

        if (t - lastStamp > trailEveryMs) {
          lastStamp = t;
          const px = eyes.x - dir.x * trailGapPx;
          const py = eyes.y - dir.y * trailGapPx;
          makeTrail(px, py);
        }

        prevEyes.x = eyes.x;
        prevEyes.y = eyes.y;

        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);
    };

    start();

    return () => {
      stopped = true;
      window.removeEventListener("pointermove", handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (overlayRef.current) overlayRef.current.remove();
      overlayRef.current = null;
    };
  }, [
    enabled,
    cursorSrc,
    eyesSrc,
    trailSrc,
    cursorSize,
    eyesSize,
    trailSize,
    trailScale,
    cursorAnchor,
    eyesAnchor,
    trailAnchor,
    cursorLerp,
    eyesLerp,
    eyesOffsetPx,
    eyesOffsetClamp,
    trailEveryMs,
    trailGapPx,
    trailDuration,
    trailOpacity,
    dirSmooth,
    minDirSpeed,
    zIndex,
    disableOnTouch,
    cursorOpacity,
    eyesOpacity,
  ]);

  return null;
}
