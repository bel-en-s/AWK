export default function ServiceCard({
  title = "Branding & Visual\nIdentity",
  items = ["Naming", "Sistemas visuales", "Guías de marca"],
  cta = "take a look",
  href = "#",
}) {
  return (
    <article className="svc-card" aria-label={title.replace("\n", " ")}>
      <div className="svc-cardTop">
        <div className="svc-icon" aria-hidden="true">
          <span className="svc-iconArrow">→</span>
        </div>

        <h3 className="svc-title">
          {title.split("\n").map((line, i) => (
            <span key={i} className="svc-titleLine">
              {line}
            </span>
          ))}
        </h3>
      </div>

      <div className="svc-cardBottom">
        <ul className="svc-list">
          {items.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>

        <a className="svc-cta" href={href}>
          {cta}
        </a>
      </div>
    </article>
  );
}
