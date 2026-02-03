import "./WorkTags.css";

export default function WorkTags({ tags = [], className = "" }) {
  if (!tags?.length) return null;

  return (
    <div className={`workTags ${className}`} aria-label="Work tags">
      {tags.map((t) => (
        <span key={t} className="workTag">
          {t}
        </span>
      ))}
    </div>
  );
}
