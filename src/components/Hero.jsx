import { useEffect, useRef } from "react";

export default function Hero() {
  const titleRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let gsapModule;

    async function init() {
      // Import dinámico para evitar SSR
      const { gsap } = await import("gsap");
      gsapModule = gsap;

      // Animación del título
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 80 },
        { opacity: 1, y: 0, duration: 1.5, ease: "power4.out" }
      );

      // Iniciar cursor + trail
      initTrailCursor(gsap);
    }

    init();

    return () => {
      // Limpiar GSAP si hace falta
      if (gsapModule) {
        gsapModule.killTweensOf("*");
      }
    };
  }, []);

  return (
    <section ref={containerRef} className="hero" style={styles.hero}>
      {/* <h1 ref={titleRef} style={styles.title}>AWAKE</h1> */}
    </section>
  );
}

/* -------------------------------------
   CURSOR + TRAIL (DXR Style)
--------------------------------------*/
function initTrailCursor(gsap) {
  const cursorImg = "/public/images/ej.png"; // tu icono

  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let cursor = { x: mouse.x, y: mouse.y };

  const lerp = (a, b, n) => (1 - n) * a + n * b;

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Cursor principal
  const main = document.createElement("img");
  main.src = cursorImg;
  main.style.position = "fixed";
  main.style.top = "0";
  main.style.left = "0";
  main.style.width = "100px";
  main.style.pointerEvents = "none";
  main.style.transformOrigin = "center";
  main.style.zIndex = "9999";
  document.body.appendChild(main);

  function animate() {
    cursor.x = lerp(cursor.x, mouse.x, 0.15);
    cursor.y = lerp(cursor.y, mouse.y, 0.15);

    main.style.transform = `translate(${cursor.x - 50}px, ${cursor.y - 50}px)`;

    // Crear clone para trail
    const clone = document.createElement("img");
    clone.src = cursorImg;
    clone.style.position = "fixed";
    clone.style.top = "0";
    clone.style.left = "0";
    clone.style.width = "100px";
    clone.style.pointerEvents = "none";
    clone.style.transformOrigin = "center";
    clone.style.zIndex = "9998";
    clone.style.transform = `translate(${cursor.x - 50}px, ${cursor.y - 50}px)`;
    document.body.appendChild(clone);

    gsap.to(clone, {
      duration: 1,
      opacity: 0,
      scale: 0.3,
      rotation: gsap.utils.random(-20, 20),
      filter: "blur(2px)",
      ease: "power2.out",
      onComplete: () => clone.remove(),
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* -------------------------------------
   INLINE ESTILOS PARA NO DEPENDER DEL CSS
--------------------------------------*/
const styles = {
  hero: {
    width: "100%",
    height: "100vh",
    background: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
    paddingLeft: "80px",
    paddingTop: "120px",
    position: "relative",
    overflow: "hidden",
  },
  title: {
    fontSize: "18vw",
    color: "black",
    margin: 0,
    lineHeight: 0.8,
    fontFamily: "WorkSansExtraBold",
  },
};
