import { useMemo, useState } from "react";
import "./Contact.css";

export default function Contact() {
  const services = useMemo(
    () => [
      "Branding & Visual Identity",
      "Web / UX & UI / Product Design",
      "Creative Direction & Campaigns",
      "Content & Motion",
      "Prototypes & Interactive",
      "Experiences",
      "Media & Performance",
      "3D & Visual Craft",
    ],
    []
  );

  const [selected, setSelected] = useState(
    () => new Set(["Branding & Visual Identity"])
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const toggle = (label) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <section className="ctc">
      <div className="ctc__inner">
        <header className="ctc__hero">
          <h1 className="ctc__title">
            Let’s do
            <br />
            something cool
          </h1>

          <span className="ctc__tag" aria-hidden="true">
            LET’S TALK
          </span>
        </header>

        <div className="ctc__grid">
          <aside className="ctc__left">
            <div className="ctc__labelBlock">
              <div className="ctc__q">
                WHAT KIND OF PROJECT CAN WE ASSIST YOU WITH?
              </div>
              <div className="ctc__hint">Choose as many as you like</div>
            </div>

            <div className="ctc__labelBlock">
              <div className="ctc__q">HOW CAN WE CONTACT YOU?</div>
            </div>

            <div className="ctc__labelBlock">
              <div className="ctc__q">READY TO GO?</div>
            </div>
          </aside>

          <main className="ctc__right">
            <section className="ctc__section">
              <div className="ctc__services" role="group" aria-label="Services">
                {services.map((s) => {
                  const isOn = selected.has(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      className={`ctc__svc ${isOn ? "is-on" : ""}`}
                      onClick={() => toggle(s)}
                      aria-pressed={isOn}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="ctc__section">
              <form className="ctc__form" onSubmit={onSubmit}>
                <label className="ctc__field">
                  <span className="ctc__label">Name</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    className="ctc__input"
                    autoComplete="name"
                  />
                </label>

                <label className="ctc__field">
                  <span className="ctc__label">Email</span>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    className="ctc__input"
                    autoComplete="email"
                  />
                </label>

                <label className="ctc__field">
                  <span className="ctc__label">Company name</span>
                  <input
                    name="company"
                    value={form.company}
                    onChange={onChange}
                    className="ctc__input"
                    autoComplete="organization"
                  />
                </label>

                <label className="ctc__field">
                  <span className="ctc__label">
                    Anything else you’d like to know
                  </span>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    className="ctc__input ctc__textarea"
                    rows={3}
                  />
                </label>
              </form>
            </section>

            <section className="ctc__section ctc__section--submit">
              <button className="ctc__submit" type="submit">
                Submit
              </button>
            </section>
          </main>
        </div>
      </div>
    </section>
  );
}
