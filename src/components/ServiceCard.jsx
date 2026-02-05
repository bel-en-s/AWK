// ServiceCard.jsx
import "./ServiceCard.css";

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9 18l6-6-6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ServiceCard({
  variant = "service",
  title,
  items = [],
  href,
  ctaLabel,
  ctaHref,
}) {
  if (variant === "cta") {
    return (
      <div className="svcCard svcCard--cta" aria-label="Start a project">
        <div className="svcCardCtaTop">
          <p className="svcCardCtaTitle">
            {String(title)
              .split("\n")
              .map((line, i) => (
                <span key={i}>
                  {line}
                  {i !== String(title).split("\n").length - 1 && <br />}
                </span>
              ))}
          </p>
        </div>

        <a className="svcCardCtaBtn" href={ctaHref || "#contact"}>
          {ctaLabel || "LET'S TALK"}
        </a>
      </div>
    );
  }

  return (
    <a className="svcCard" href={href || "#"} aria-label={title}>
      <div className="svcCardHead">
        <div className="svcCardIcon">
          <ArrowIcon />
        </div>

        <h4 className="svcCardTitle">
          {String(title)
            .split("\n")
            .map((line, i) => (
              <span key={i}>
                {line}
                {i !== String(title).split("\n").length - 1 && <br />}
              </span>
            ))}
        </h4>
      </div>

      <div className="svcCardBottom">
        <ul className="svcCardList">
          {items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>

        <span className="svcCardPill">take a look</span>
      </div>
    </a>
  );
}
