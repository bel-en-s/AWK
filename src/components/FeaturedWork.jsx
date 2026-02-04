import "./FeaturedWork.css";



const withBase = (p) => `${import.meta.env.BASE_URL}${String(p).replace(/^\/+/, "")}`;

const WORKS = [
  {
    id: "work-1",
    title: "The Perfect Surgery",
    image: "images/workPreview/1.png",
    tags: ["Branding", "Web", "UI/UX"],
    href: "#",
  },
  {
    id: "work-2",
    title: "CRAFT",
    image: "images/workPreview/2.jpg",
    tags: ["Art Direction", "Motion"],
    href: "#",
  },
  {
    id: "work-3",
    title: "Experiment 03",
    image: "images/workPreview/3.jpg",
    tags: ["Experiment", "Creative Dev"],
    href: "#",
  },
];

export default function WorksPreview({ works = WORKS, allWorkHref = "#" }) {
  return (
    <section className="awk-works" aria-label="Works preview">
      <div className="awk-works__grid">
        {works.map((work) => (
          <article key={work.id} className="awk-work">
            <a className="awk-work__card" href={work.href} aria-label={work.title}>
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
        ))}
      </div>

      <div className="awk-works__footer">
        <a className="awk-allWork" href={allWorkHref} aria-label="All work">
          <span className="awk-allWork__label">ALL WORK</span>
          <span className="awk-allWork__circle" aria-hidden="true">
            <span className="awk-allWork__chev">›</span>
          </span>
        </a>
      </div>
    </section>
  );
}
