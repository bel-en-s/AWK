import WorkTags from "./UI/WorkTags";
import "./WorksPreview.css";

const DEFAULT_WORKS = [
  {
    id: "perfect-surgery",
    title: "The Perfect\nSurgery",
    subtitle: "Branding + Web",
    tags: ["Branding", "Naming", "Web Front End", "UI & UX", "Experiments", "Paid Media"],
    image: "images/portfolio/PORTADAS-01.jpg",
    href: "#",
  },
  {
    id: "craft",
    title: "CRAFT",
    subtitle: "E-commerce + Art Direction",
    tags: ["Branding", "Concept", "Experiments", "Ad", "Retail Branding"],
    image: "images/portfolio/PORTADAS-01.jpg",
    href: "#",
  },
  {
    id: "winter",
    title: "WINTER DROP",
    subtitle: "Film + Editorial Motion",
    tags: ["Branding", "Concept", "Logo", "Experiments", "Documents"],
    image: `${import.meta.env.BASE_URL}images/works/winter.jpg`,
    href: "#",
  },
];

function Tile({ item, className = "" }) {
  return (
    <a className={`wprev-tile ${className}`} href={item.href || "#"} aria-label={item.title || "Work"}>
      <img className="wprev-tile__img" src={item.image} alt="" loading="lazy" />
      <div className="wprev-tile__shade" aria-hidden="true" />

      <div className="wprev-tile__ui">
        <div className="wprev-tile__head">
          <h3 className="wprev-tile__title">{item.title}</h3>
          <p className="wprev-tile__sub">{item.subtitle}</p>
        </div>

        <div className="wprev-tile__foot">
          <div className="wprev-tile__tags">
            <WorkTags tags={item.tags || []} />
          </div>

          <span className="wprev-tile__go" aria-hidden="true">
            <span className="wprev-tile__goIco">→</span>
          </span>
        </div>
      </div>
    </a>
  );
}

function CtaTile({ href, label, desc }) {
  return (
    <a className="wprev-cta" href={href} aria-label={label}>
      <div className="wprev-cta__inner">
        <div className="wprev-cta__top">
          <span className="wprev-cta__label">{label}</span>
          <span className="wprev-cta__go" aria-hidden="true">
            →
          </span>
        </div>
        <p className="wprev-cta__desc">{desc}</p>
      </div>
    </a>
  );
}

export default function WorksPreview({
  works = DEFAULT_WORKS,
  label = "WORK",
  className = "",
  showCta = true,
  ctaHref = "/work",
  ctaLabel = "ALL WORK",
  ctaDesc = "Branding, Naming, Web Front End & Back-end, Documentation, Fine-Motion & 3D Experiments, Paid Media",
}) {
  // 3 tiles + cta
  const a = works?.[0];
  const b = works?.[1];
  const c = works?.[2];

  return (
    <section className={`wprev ${className}`} aria-label="Works preview">
      <div className="wprev__inner">
        <div className="wprev__top">
          <h2 className="wprev__label">{label}</h2>
        </div>

        <div className="wprev__grid" aria-label="Works grid">
          {a && <Tile item={a} className="wprev-tile--a" />}
          {b && <Tile item={b} className="wprev-tile--b" />}
          {c && <Tile item={c} className="wprev-tile--c" />}

          {showCta && <CtaTile href={ctaHref} label={ctaLabel} desc={ctaDesc} />}
        </div>
      </div>
    </section>
  );
}
