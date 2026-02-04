import "./FeaturedWork.css";


const withBase = (p) => `${import.meta.env.BASE_URL}${String(p).replace(/^\/+/, "")}`;
const isExternal = (href) => /^https?:\/\//i.test(String(href));

const WORKS = [
  {
    id: "work-1",
    title: "The Perfect Surgery",
    image: "images/workPreview/1.png",
    tags: ["Branding", "Web", "UI/UX"],
    href: "work",
  },
  {
    id: "work-2",
    title: "CRAFT",
    image: "images/workPreview/2.jpg",
    tags: ["Art Direction", "Motion"],
    href: "work",
  },
  {
    id: "work-3",
    title: "Experiment 03",
    image: "images/workPreview/3.jpg",
    tags: ["Experiment", "Creative Dev"],
    href: "work",
  },
];

export default function WorksPreview({ works = WORKS, allWorkHref = "work", className = "" }) {
  const allWorkResolved = isExternal(allWorkHref) ? allWorkHref : withBase(allWorkHref);

  return (
    <section className={`awk-works ${className}`} aria-label="Works preview">
      <div className="awk-works__inner">
        <div className="awk-works__grid">
          {works.map((work) => {
            const hrefResolved = isExternal(work.href) ? work.href : withBase(work.href);

            return (
              <article key={work.id} className="awk-work">
                <a className="awk-work__card" href={hrefResolved} aria-label={work.title} data-cursor="blue">
                  <div className="awk-work__media">
                    <img src={withBase(work.image)} alt="" loading="lazy" />
                    <span className="awk-work__arrowBtn" aria-hidden="true">
                      <span className="awk-work__arrowIco">›</span>
                    </span>
                  </div>

                  <ul className="awk-work__tags" aria-label="Tags">
                    {work.tags.map((tag) => (
                      <li key={tag} className="awk-work__tag">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </a>
              </article>
            );
          })}
        </div>

        <div className="awk-works__footer">
          <a className="awk-allWork" href={allWorkResolved} aria-label="All work" data-cursor="blue">
            <span className="awk-allWork__label">SEE ALL WORK</span>
            <span className="awk-allWork__circle" aria-hidden="true">
              <span className="awk-allWork__chev">›</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
