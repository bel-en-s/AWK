import "./Blog.css";

const POSTS = {
  leftTop: {
    title: "La guerra de los clicks:\nQué cambió en la\npublicidad con el análisis\nde datos",
    image: "/images/blog/blog-01.jpg",
    href: "#",
  },
  leftBottom: {
    title: "Cómo la IA está\ntransformando el Marketing\ny la Publicidad?",
    image: "/images/blog/blog-02.jpg",
    href: "#",
  },
  rightTop: {
    title:
      "IDNTITY / Sebastián Linck\ny Diego Cuervo: Creando\nel Uber de la agencia de\nmedios",
    image: "/images/blog/blog-03.jpg",
    href: "#",
  },
  rightBottom: {
    title: "A digital-first studio\namong U.S. Latino\nAgencies",
    image: "/images/blog/blog-04.jpg",
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
        <img src={image} alt="" loading="lazy" />
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
       

        {/* Big title */}
        <h2 className="blogTitle">NEWS</h2>

        {/* Grid */}
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
              variant="split"
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
