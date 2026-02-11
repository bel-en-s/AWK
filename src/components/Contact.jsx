// Contact.jsx
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import "./Contact.css";
import { sendContactEmail } from "./utils/email";

function isCoarsePointer() {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(pointer: coarse)")?.matches;
}

export default function Contact() {
  const titleRef = useRef(null);
  const letsTalkRef = useRef(null);

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

  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState({ ok: null, msg: "" });

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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isSending) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      message: form.message.trim(),
      services: Array.from(selected),
    };

    if (!payload.name || !payload.email) {
      setStatus({ ok: false, msg: "Name and email are required." });
      return;
    }

    try {
      setIsSending(true);
      setStatus({ ok: null, msg: "" });

      await sendContactEmail(payload);

      setStatus({ ok: true, msg: "Sent. I’ll get back to you soon." });

      // reset
      setForm({ name: "", email: "", company: "", message: "" });
      setSelected(new Set());
    } catch (err) {
      console.error(err);
      setStatus({ ok: false, msg: "Something went wrong sending the email." });
    } finally {
      setIsSending(false);
    }
  };

  const renderLetters = (str) =>
    Array.from(str).map((ch, i) => (
      <span key={`${ch}-${i}`} className="ctc__letter" aria-hidden="true">
        {ch === " " ? "\u00A0" : ch}
      </span>
    ));

  // typing title (sin caret)
  useLayoutEffect(() => {
    const root = titleRef.current;
    if (!root) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const ctx = gsap.context(() => {
      const letters = Array.from(root.querySelectorAll(".ctc__letter"));
      if (!letters.length) return;

      gsap.killTweensOf(letters);

      if (prefersReduced) {
        gsap.set(letters, { autoAlpha: 1 });
        return;
      }

      gsap.set(letters, { autoAlpha: 0 });

      gsap.to(letters, {
        autoAlpha: 1,
        duration: 0,
        stagger: 0.03,
        ease: "none",
      });
    }, root);

    return () => ctx.revert();
  }, []);

  // LET'S TALK hover (copiado del Hero)
  useLayoutEffect(() => {
    const el = letsTalkRef.current;
    if (!el) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const coarse = isCoarsePointer();
    if (prefersReduced || coarse) return;

    const BASE = 8;
    const baseRot = -BASE;
    const hoverRot = BASE;

    let wiggle = null;

    gsap.set(el, {
      rotateZ: baseRot,
      scale: 1,
      y: 0,
      transformOrigin: "50% 50%",
      willChange: "transform",
      force3D: true,
    });

    const enter = () => {
      gsap.to(el, {
        rotateZ: hoverRot,
        scale: 1.03,
        y: -1,
        duration: 0.32,
        ease: "expo.out",
        overwrite: "auto",
      });

      wiggle?.kill();
      wiggle = gsap.to(el, {
        rotateZ: hoverRot + 2,
        duration: 0.85,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        overwrite: "auto",
      });
    };

    const leave = () => {
      wiggle?.kill();
      wiggle = null;

      gsap.to(el, {
        rotateZ: baseRot,
        scale: 1,
        y: 0,
        duration: 0.55,
        ease: "expo.out",
        overwrite: "auto",
      });
    };

    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focus", enter);
    el.addEventListener("blur", leave);

    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focus", enter);
      el.removeEventListener("blur", leave);
      wiggle?.kill();
    };
  }, []);

  return (
    <section className="ctc" id="contact">
      <div className="ctc__inner">
        <header className="ctc__hero">
          <h1
            ref={titleRef}
            className="ctc__title"
            aria-label="Let’s do something cool"
          >
            <span className="ctc__line">{renderLetters("Let’s do")}</span>
            <br />
            <span className="ctc__line">{renderLetters("something cool")}</span>
          </h1>

          <a
            ref={letsTalkRef}
            className="ctc__letsTalk"
            href="#contact"
            aria-label="Let's talk"
          >
            LET&apos;S TALK
          </a>
        </header>

        {/* layout 2 rows x 2 cols */}
        <div className="ctc__grid">
          {/* Row 1 - Left */}
          <div className="ctc__cell ctc__cell--leftTop">
            <div className="ctc__q">
              WHAT KIND OF PROJECT CAN WE ASSIST YOU WITH?
            </div>
            <div className="ctc__hint">Choose as many as you like</div>
          </div>

          {/* Row 1 - Right */}
          <div className="ctc__cell ctc__cell--rightTop">
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
          </div>

          {/* Row 2 - Left */}
          <div className="ctc__cell ctc__cell--leftBottom">
            <div className="ctc__q">HOW CAN WE CONTACT YOU?</div>
            <div className="ctc__q ctc__q--ready">READY TO GO?</div>
          </div>

          {/* Row 2 - Right */}
          <div className="ctc__cell ctc__cell--rightBottom">
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

              <div className="ctc__submitRow">
                <button className="ctc__submit" type="submit" disabled={isSending}>
                  {isSending ? "Sending..." : "Submit"}
                </button>

                {status.ok !== null && (
                  <span
                    className={`ctc__status ${status.ok ? "is-ok" : "is-bad"}`}
                    role="status"
                    aria-live="polite"
                  >
                    {status.msg}
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
