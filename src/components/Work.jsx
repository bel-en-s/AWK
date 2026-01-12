import { useEffect, useRef } from "react";
import "./Work.css";

const PROJECTS = [
  {
    title: "Motion Clinic",
    image: "images/portfolio/1.jpg",
    category: "Creative Web Design",
    year: "2025",
  },
  {
    title: "Shadowwear 6AM",
    image: "images/portfolio/img_2.jpg",
    category: "Photography",
    year: "2024",
  },
  {
    title: "Blur Formation 03",
    image: "images/portfolio/3.jpg",
    category: "Kinetic Study",
    year: "2024",
  },
  {
    title: "Sunglass Operator",
    image: "images/portfolio/img_4.jpg",
    category: "Editorial Motion",
    year: "2023",
  },
  {
    title: "Azure Figure 5",
    image: "images/portfolio/img_5.jpg",
    category: "Visual Research",
    year: "2024",
  },
];

export default function Work({ projects = PROJECTS }) {
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const rafRef = useRef(0);
  const stRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const list = listRef.current;
    if (!root || !list) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const base = import.meta.env.BASE_URL || "/";
    const data = (Array.isArray(projects) ? projects : PROJECTS).map((p) => ({
      ...p,
      image: p.image?.startsWith("http")
        ? p.image
        : `${base}${String(p.image || "")}`.replace(/\/{2,}/g, "/"),
    }));

    const config = {
      SCROLL_SPEED: 0.78,
      LERP: 0.06,
      BUFFER: 5,
      MAX_VEL: 150,
      SNAP_MS: 520,
    };

    const lerp = (a, b, t) => a + (b - a) * t;

    const st = {
      currentY: 0,
      targetY: 0,
      isDragging: false,
      isSnapping: false,
      snapStart: { t: 0, y: 0, target: 0 },
      lastScrollTime: Date.now(),
      dragStart: { y: 0, scrollY: 0 },
      height: window.innerHeight,
      items: new Map(),
    };
    stRef.current = st;

    const idxToData = (index) => {
      const i = ((Math.abs(index) % data.length) + data.length) % data.length;
      return { i, item: data[i] };
    };

    const createParallax = (img, height, strength = 0.2, scale = 1.12) => {
      let cur = 0;
      return {
        update: (scroll, index) => {
          const target = (-scroll - index * height) * strength;
          cur = lerp(cur, target, 0.1);
          if (Math.abs(cur - target) > 0.01) {
            img.style.transform = `translateY(${cur}px) scale(${scale})`;
          }
        },
      };
    };

    const clear = () => {
      list.innerHTML = "";
      st.items.clear();
    };

    const createItem = (index) => {
      if (st.items.has(index)) return;

      const { i, item } = idxToData(index);
      const num = String(i + 1).padStart(2, "0");

      const el = document.createElement("section");
      el.className = "wk2-item";
      el.setAttribute("aria-label", item.title);

      el.innerHTML = `
        <div class="wk2-bg" aria-hidden="true">
          <img class="wk2-bgImg" src="${item.image}" alt="" />
        </div>

        <div class="wk2-card" role="group" aria-label="Project card">
          <div class="wk2-meta wk2-meta--tl">${num}</div>

          <div class="wk2-title">${item.title}</div>

          <div class="wk2-meta wk2-meta--bl">${item.category}</div>
          <div class="wk2-meta wk2-meta--br">${item.year}</div>
        </div>
      `;

      list.appendChild(el);

      const bgImg = el.querySelector(".wk2-bgImg");

      st.items.set(index, {
        el,
        bgParallax: createParallax(bgImg, st.height, 0.18, 1.14),
      });
    };

    const seed = () => {
      clear();
      for (let i = -config.BUFFER; i <= config.BUFFER; i++) createItem(i);
    };

    const sync = () => {
      const current = Math.round(-st.targetY / st.height);
      const min = current - config.BUFFER;
      const max = current + config.BUFFER;

      for (let i = min; i <= max; i++) createItem(i);

      st.items.forEach((obj, index) => {
        if (index < min || index > max) {
          obj.el.remove();
          st.items.delete(index);
        }
      });
    };

    const snapTo = () => {
      st.isSnapping = true;
      st.snapStart.t = Date.now();
      st.snapStart.y = st.targetY;
      st.snapStart.target = -Math.round(-st.targetY / st.height) * st.height;
    };

    const updateSnap = () => {
      const p = Math.min((Date.now() - st.snapStart.t) / config.SNAP_MS, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      st.targetY =
        st.snapStart.y + (st.snapStart.target - st.snapStart.y) * eased;
      if (p >= 1) st.isSnapping = false;
    };

    const render = () => {
      const now = Date.now();

      if (!prefersReduced) {
        if (!st.isDragging && !st.isSnapping && now - st.lastScrollTime > 120) {
          const snapPoint = -Math.round(-st.targetY / st.height) * st.height;
          if (Math.abs(st.targetY - snapPoint) > 1) snapTo();
        }

        if (st.isSnapping) updateSnap();

        if (!st.isDragging) {
          st.currentY += (st.targetY - st.currentY) * config.LERP;
        } else {
          st.currentY = st.targetY;
        }
      } else {
        st.currentY = st.targetY;
      }

      sync();

      st.items.forEach((obj, index) => {
        const y = index * st.height + st.currentY;
        obj.el.style.transform = `translateY(${y}px)`;
        obj.bgParallax.update(st.currentY, index);
      });

      rafRef.current = requestAnimationFrame(render);
    };

    const onWheel = (e) => {
      e.preventDefault();
      st.isSnapping = false;
      st.lastScrollTime = Date.now();

      const delta = Math.max(
        Math.min(e.deltaY * config.SCROLL_SPEED, config.MAX_VEL),
        -config.MAX_VEL
      );
      st.targetY -= delta;
    };

    const onTouchStart = (e) => {
      st.isDragging = true;
      st.isSnapping = false;
      st.dragStart = { y: e.touches[0].clientY, scrollY: st.targetY };
      st.lastScrollTime = Date.now();
    };

    const onTouchMove = (e) => {
      if (!st.isDragging) return;
      st.targetY =
        st.dragStart.scrollY + (e.touches[0].clientY - st.dragStart.y) * 1.5;
      st.lastScrollTime = Date.now();
    };

    const onTouchEnd = () => {
      st.isDragging = false;
    };

    const onResize = () => {
      st.height = window.innerHeight;
      seed();
    };

    seed();
    rafRef.current = requestAnimationFrame(render);

    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: true });
    root.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      clear();
    };
  }, [projects]);

  return (
    <main ref={rootRef} className="wk2" aria-label="Work">
      <div className="wk2-list" ref={listRef} />
    </main>
  );
}
