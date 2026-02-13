import { useEffect, useRef } from "react";

export default function CursorLanding({
  cursorSrc = `${import.meta.env.BASE_URL}images/cursor.svg`,
  blueCursorSrc = `${import.meta.env.BASE_URL}images/cursor-blue.svg`,
  eyesSrc = `${import.meta.env.BASE_URL}images/ojos.svg`,
  trailSrc = `${import.meta.env.BASE_URL}images/trail.svg`,

  cursorSize = 42,
  eyesSize = 140,

  trailSize = 130,
  trailScale = 1,

  cursorAnchor = { x: 0.5, y: 0.5 },
  eyesAnchor = { x: 0.5, y: 0.5 },
  trailAnchor = { x: 0.5, y: 0.5 },

  eyesLerp = 0.022,

  eyesOffsetPx = 220,
  eyesOffsetClamp = 300,

  trailEveryMs = 28,
  trailGapPx = 1,
  trailDuration = 1.6,
  trailOpacity = 0.75,

  dirSmooth = 0.12,
  minDirSpeed = 0.12,

  zIndex = 2147483647,

  enabled = true,
  disableOnTouch = false,

  cursorOpacity = 1,
  eyesOpacity = 1,

  activeAreaRef = null,
  eyesOnlyInside = false,
  eyesFade = 0.22,

  mobileMode = "auto", // "auto" | "touch" | "gyro"
  idleMs = 700,
  autoEnabled = true,
  autoSpeed = 0.35,
  autoRadiusX = 90,
  autoRadiusY = 55,
  autoCenter = { x: 0.5, y: 0.45 },
  autoTrailEveryMs = 55,

  enterTrail = true,

  cursorAttr = "data-cursor",

  eyesEventName = "awk:eyes",

  // ✅ NUEVO: ocultar ojitos (y trail) en mobile
  hideEyesOnMobile = true,
}) {
  const rafRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia?.("(pointer: coarse)")?.matches;

    if (disableOnTouch && isTouchDevice) return;

    let gsap = null;
    let stopped = false;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cursor = { x: mouse.x, y: mouse.y };
    const eyes = { x: mouse.x, y: mouse.y };

    const prevEyes = { x: eyes.x, y: eyes.y };
    const prevMouse = { x: mouse.x, y: mouse.y };
    const dir = { x: 1, y: 0 };

    const lerp = (a, b, n) => (1 - n) * a + n * b;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    let overlay = null;
    let cursorEl = null;
    let eyesEl = null;

    let lastInside = true;
    let enteredInside = false;

    let lastInputAt = performance.now();

    // ✅ flag global para forzar oculto (Services / Mobile / etc)
    let eyesForceHidden = false;

    // -------------------------
    // Cursor MODE (data-cursor)
    // -------------------------
    let cursorMode = "normal"; // normal | blue | invert

    const applyCursorMode = (mode) => {
      if (!cursorEl) return;
      if (mode === cursorMode) return;
      cursorMode = mode;

      if (mode === "normal") {
        cursorEl.src = cursorSrc;
        cursorEl.style.mixBlendMode = "difference";
        cursorEl.style.filter =
          "drop-shadow(0 0 8px rgba(255,255,255,0.25)) drop-shadow(0 0 1px rgba(0,0,0,0.35))";
        cursorEl.style.opacity = String(cursorOpacity);
        return;
      }

      if (mode === "blue") {
        cursorEl.src = blueCursorSrc;
        cursorEl.style.mixBlendMode = "normal";
        cursorEl.style.filter =
          "drop-shadow(0 0 10px rgba(0,0,0,0.25)) drop-shadow(0 0 1px rgba(255,255,255,0.20))";
        cursorEl.style.opacity = String(cursorOpacity);
        return;
      }

      if (mode === "invert") {
        cursorEl.src = cursorSrc;
        cursorEl.style.mixBlendMode = "difference";
        cursorEl.style.filter =
          "brightness(0) invert(1) drop-shadow(0 0 8px rgba(255,255,255,0.25)) drop-shadow(0 0 1px rgba(0,0,0,0.35))";
        cursorEl.style.opacity = String(cursorOpacity);
        return;
      }
    };

    const pickModeFromTarget = (target) => {
      const el = target?.closest?.(`[${cursorAttr}]`);
      if (!el) return "normal";
      const v = el.getAttribute(cursorAttr);
      if (v === "blue") return "blue";
      if (v === "invert") return "invert";
      return "normal";
    };

    const onOver = (e) => applyCursorMode(pickModeFromTarget(e.target));
    const onOut = (e) => {
      const to = pickModeFromTarget(e.relatedTarget);
      applyCursorMode(to);
    };

    const computeInside = (x, y) => {
      if (!eyesOnlyInside) return true;
      const el = activeAreaRef?.current;
      if (!el) return true;
      const r = el.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };

    const setEyesVisible = (v) => {
      if (!eyesEl) return;

      // ✅ respeta forzado oculto
      const want = v && !eyesForceHidden;
      const target = want ? eyesOpacity : 0;

      if (gsap) {
        gsap.to(eyesEl, {
          opacity: target,
          duration: eyesFade,
          ease: "power2.out",
          overwrite: "auto",
        });
      } else {
        eyesEl.style.opacity = String(target);
      }
    };

    const updateInside = () => {
      const inside = computeInside(mouse.x, mouse.y);
      if (inside === lastInside) return;

      lastInside = inside;
      enteredInside = inside;

      setEyesVisible(inside);

      if (inside && !eyesForceHidden) {
        eyes.x = mouse.x;
        eyes.y = mouse.y;
        prevEyes.x = eyes.x;
        prevEyes.y = eyes.y;
        prevMouse.x = mouse.x;
        prevMouse.y = mouse.y;
      }
    };

    const setInput = (x, y) => {
      mouse.x = x;
      mouse.y = y;
      lastInputAt = performance.now();
      updateInside();
    };

    const handlePointerMove = (e) => setInput(e.clientX, e.clientY);

    const onTouchStart = (e) => {
      const t = e.touches?.[0];
      if (!t) return;
      setInput(t.clientX, t.clientY);
    };

    const onTouchMove = (e) => {
      const t = e.touches?.[0];
      if (!t) return;
      setInput(t.clientX, t.clientY);
    };

    const onTouchEnd = () => {};

    // -------------------------
    // DOM creation
    // -------------------------
    const createOverlay = () => {
      overlay = document.createElement("div");
      overlay.className = "cursor-landing-overlay";
      Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        pointerEvents: "none",
        overflow: "visible",
        zIndex: String(zIndex),
        background: "transparent",
        isolation: "auto",
      });

      document.body.appendChild(overlay);
      overlayRef.current = overlay;
    };

    const createCursor = () => {
      cursorEl = document.createElement("img");
      cursorEl.classList.add("awk-cursor-contrast");
      cursorEl.src = cursorSrc;
      cursorEl.decoding = "async";
      cursorEl.loading = "eager";
      cursorEl.draggable = false;

      Object.assign(cursorEl.style, {
        position: "absolute",
        left: "0px",
        top: "0px",
        width: `${cursorSize}px`,
        height: `${cursorSize}px`,
        userSelect: "none",
        pointerEvents: "none",
        willChange: "transform, opacity, filter",
        opacity: String(cursorOpacity),
        zIndex: "3",
        transform: "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
        filter:
          "drop-shadow(0 0 8px rgba(255,255,255,0.25)) drop-shadow(0 0 1px rgba(0,0,0,0.35))",
      });

      overlay.appendChild(cursorEl);
      applyCursorMode("normal");
    };

    const createEyes = () => {
      eyesEl = document.createElement("img");
      eyesEl.src = eyesSrc;
      eyesEl.decoding = "async";
      eyesEl.loading = "eager";
      eyesEl.draggable = false;

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
      if (eyesForceHidden) return;
      if (!gsap || !overlay) return;

      const img = document.createElement("img");
      img.src = trailSrc;
      img.decoding = "async";
      img.loading = "eager";
      img.draggable = false;

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

    // -------------------------
    // Autopilot
    // -------------------------
    const applyAutopilot = (t) => {
      if (!autoEnabled) return;
      const cx = window.innerWidth * autoCenter.x;
      const cy = window.innerHeight * autoCenter.y;

      const tt = t * 0.001 * autoSpeed;
      mouse.x = cx + Math.cos(tt * 1.2) * autoRadiusX;
      mouse.y = cy + Math.sin(tt * 0.9) * autoRadiusY;
    };

    // Gyro
    let gyroOn = false;
    const onDeviceOrientation = (e) => {
      const g = typeof e.gamma === "number" ? e.gamma : 0;
      const b = typeof e.beta === "number" ? e.beta : 0;

      if (!gyroOn) gyroOn = true;

      const cx = window.innerWidth * autoCenter.x;
      const cy = window.innerHeight * autoCenter.y;

      const nx = clamp(g / 30, -1, 1);
      const ny = clamp(b / 45, -1, 1);

      setInput(cx + nx * autoRadiusX, cy + ny * autoRadiusY);
    };

    // -------------------------
    // External hide/show (Hero)
    // -------------------------
    const setEyesForcedHidden = (hidden) => {
      eyesForceHidden = !!hidden;

      if (eyesForceHidden) {
        setEyesVisible(false);
      } else {
        const inside = computeInside(mouse.x, mouse.y);
        lastInside = inside;
        setEyesVisible(inside);

        eyes.x = mouse.x;
        eyes.y = mouse.y;
        prevEyes.x = eyes.x;
        prevEyes.y = eyes.y;
        prevMouse.x = mouse.x;
        prevMouse.y = mouse.y;
      }
    };

    // ✅ MOBILE RULE
    const shouldHideEyesNow = () => hideEyesOnMobile && isTouchDevice;

    const syncMobileHide = () => {
      if (shouldHideEyesNow()) setEyesForcedHidden(true);
      else setEyesForcedHidden(false);
    };

    const onEyesEvent = (e) => {
      // si estás en mobile con hideEyesOnMobile, ignorá show=true
      if (shouldHideEyesNow()) {
        setEyesForcedHidden(true);
        return;
      }

      const d = e?.detail || {};
      if (typeof d.show === "boolean") setEyesForcedHidden(!d.show);
      else if (typeof d.hidden === "boolean") setEyesForcedHidden(d.hidden);
    };

    // -------------------------
    // Start
    // -------------------------
    const start = async () => {
      const mod = await import("gsap");
      gsap = mod.gsap;

      document.documentElement.classList.add("awk-cursor-none");

      createOverlay();
      createEyes();
      createCursor();

      document.addEventListener("pointerover", onOver, true);
      document.addEventListener("pointerout", onOut, true);

      window.addEventListener(eyesEventName, onEyesEvent);

      // ✅ aplica regla mobile al iniciar
      syncMobileHide();

      lastInside = computeInside(mouse.x, mouse.y);
      setEyesVisible(lastInside);

      const wantTouch =
        isTouchDevice && (mobileMode === "auto" || mobileMode === "touch");
      const wantGyro = isTouchDevice && mobileMode === "gyro";

      if (wantTouch) {
        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: true });
        window.addEventListener("touchend", onTouchEnd, { passive: true });
      } else {
        window.addEventListener("pointermove", handlePointerMove, { passive: true });
      }

      if (wantGyro) {
        window.addEventListener("deviceorientation", onDeviceOrientation, true);
      }

      const onResize = () => {
        // ✅ por si rota / cambia coarse
        syncMobileHide();
        updateInside();
      };

      window.addEventListener("scroll", updateInside, { passive: true });
      window.addEventListener("resize", onResize);

      let lastStamp = 0;

      const animate = (t = performance.now()) => {
        if (stopped) return;

        const idle = t - lastInputAt;
        const allowAutoNow =
          isTouchDevice &&
          autoEnabled &&
          mobileMode !== "touch" &&
          idle > idleMs &&
          (!wantGyro || !gyroOn);

        if (allowAutoNow) {
          applyAutopilot(t);
          updateInside();
        }

        cursor.x = mouse.x;
        cursor.y = mouse.y;

        const cx = cursor.x - cursorSize * cursorAnchor.x;
        const cy = cursor.y - cursorSize * cursorAnchor.y;
        if (cursorEl) cursorEl.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;

        if (eyesForceHidden) {
          rafRef.current = requestAnimationFrame(animate);
          return;
        }

        if (lastInside) {
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

          const vmx = mouse.x - prevMouse.x;
          const vmy = mouse.y - prevMouse.y;
          const spMouse = Math.hypot(vmx, vmy);

          const extra = clamp(spMouse * 6.0, 0, eyesOffsetClamp);
          prevMouse.x = mouse.x;
          prevMouse.y = mouse.y;

          const dist = eyesOffsetPx + extra;

          const targetEyesX = cursor.x - dir.x * dist;
          const targetEyesY = cursor.y - dir.y * dist;

          eyes.x = lerp(eyes.x, targetEyesX, eyesLerp);
          eyes.y = lerp(eyes.y, targetEyesY, eyesLerp);

          const ex = eyes.x - eyesSize * eyesAnchor.x;
          const ey = eyes.y - eyesSize * eyesAnchor.y;
          if (eyesEl) eyesEl.style.transform = `translate3d(${ex}px, ${ey}px, 0)`;

          if (enteredInside && enterTrail) {
            enteredInside = false;
            lastStamp = t;
            makeTrail(eyes.x, eyes.y);
          }

          const localEvery = allowAutoNow ? autoTrailEveryMs : trailEveryMs;

          if (t - lastStamp > localEvery) {
            lastStamp = t;
            const px = eyes.x - dir.x * trailGapPx;
            const py = eyes.y - dir.y * trailGapPx;
            makeTrail(px, py);
          }

          prevEyes.x = eyes.x;
          prevEyes.y = eyes.y;
        }

        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);

      // guardo handler para cleanup
      start._onResize = onResize;
    };

    start();

    return () => {
      stopped = true;

      document.removeEventListener("pointerover", onOver, true);
      document.removeEventListener("pointerout", onOut, true);

      window.removeEventListener(eyesEventName, onEyesEvent);

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("deviceorientation", onDeviceOrientation, true);

      window.removeEventListener("scroll", updateInside);
      // si start llegó a setearlo:
      if (start._onResize) window.removeEventListener("resize", start._onResize);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (overlayRef.current) overlayRef.current.remove();
      overlayRef.current = null;

      document.documentElement.classList.remove("awk-cursor-none");
    };
  }, [
    enabled,
    cursorSrc,
    blueCursorSrc,
    eyesSrc,
    trailSrc,
    cursorSize,
    eyesSize,
    trailSize,
    trailScale,
    cursorAnchor,
    eyesAnchor,
    trailAnchor,
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
    activeAreaRef,
    eyesOnlyInside,
    eyesFade,
    mobileMode,
    idleMs,
    autoEnabled,
    autoSpeed,
    autoRadiusX,
    autoRadiusY,
    autoCenter,
    autoTrailEveryMs,
    enterTrail,
    cursorAttr,
    eyesEventName,
    hideEyesOnMobile, 
  ]);

  return null;
}
