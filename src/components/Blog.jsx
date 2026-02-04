import "./Blog.css";

const BASE = import.meta.env.BASE_URL;
const FALLBACK_IMG = "/images/blog/1.webp";

const withBase = (p) => {
  const base = BASE.endsWith("/") ? BASE : `${BASE}/`;
  const cleanPath = String(p || "").replace(/^\//, "");
  return `${base}${cleanPath}`;
};

const POSTS = {
  leftTop: {
    title: "La guerra de los clicks:\nQué cambió en la\npublicidad con el análisis\nde datos",
    image: "/images/blog/1.webp",
    href: "#",
  },
  leftBottom: {
    title: "Cómo la IA está\ntransformando el Marketing\ny la Publicidad?",
    image: "/images/blog/1.webp",
    href: "#",
  },
  rightTop: {
    title:
      "IDNTITY / Sebastián Linck\ny Diego Cuervo: Creando\nel Uber de la agencia de\nmedios",
    image: "/images/blog/1.webp",
    href: "#",
  },
  rightBottom: {
    title: "A digital-first studio\namong U.S. Latino\nAgencies",
    image: "/images/blog/2.jpg",
    href: "#",
  },
};

function ArrowBadge() {
  return (
    <span className="blogArrow" aria-hidden="true">
      ↗
    </span>
  );
}

function PostCard({ variant = "vertical", title, image, href = "#" }) {
  return (
    <a className={`blogCard blogCard--${variant}`} href={href}>
      <div className="blogCard__media">
        <img
          src={withBase(image)}
          alt=""
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.fallbackApplied) return;
            img.dataset.fallbackApplied = "1";
            img.src = withBase(FALLBACK_IMG);
          }}
        />
      </div>

      <div className="blogCard__body">
        <p className="blogCard__title">{title}</p>
        <ArrowBadge />
      </div>
    </a>
  );
}

export default function Blog() {
  return (
    <section className="blogSection" id="blog">
      <div className="blogWrap">
        <h2 className="blogTitle">NEWS</h2>

        <div className="blogGrid">
          <div className="blogCol blogCol--left">
            <PostCard
              variant="vertical"
              title={POSTS.leftTop.title}
              image={POSTS.leftTop.image}
              href={POSTS.leftTop.href}
            />
            <PostCard
              variant="vertical"
              title={POSTS.leftBottom.title}
              image={POSTS.leftBottom.image}
              href={POSTS.leftBottom.href}
            />
          </div>

          <div className="blogCol blogCol--right">
            <PostCard
              variant="vertical"
              title={POSTS.rightTop.title}
              image={POSTS.rightTop.image}
              href={POSTS.rightTop.href}
            />
            <PostCard
              variant="vertical"
              title={POSTS.rightBottom.title}
              image={POSTS.rightBottom.image}
              href={POSTS.rightBottom.href}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
