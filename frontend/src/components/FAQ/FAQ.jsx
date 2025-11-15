import { useState } from "react";
import "./FAQ.css";

const faqs = [
  {
    q: "How do I reserve a table?",
    a: "Use our reservation flow on the Home page or visit the Reservation page to pick date and time.",
  },
  {
    q: "Do you offer online delivery?",
    a: "Yes — we offer online delivery. Look for the Online Delivery badge and place an order from the Menu.",
  },
  {
    q: "Can I modify my reservation?",
    a: "Yes — contact us or use the My Account section to update your reservation.",
  },
];

const FAQ = () => {
  const [open, setOpen] = useState(null);
  return (
    <section className="faq" aria-labelledby="faq-title">
      <h3 id="faq-title">Frequently asked questions</h3>
      <div className="faq-list">
        {faqs.map((f, i) => (
          <div key={i} className={`faq-item ${open === i ? "open" : ""}`}>
            <button
              className="faq-q"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              <span className="faq-q-text">{f.q}</span>
              <span className="faq-q-icon" aria-hidden>
                {open === i ? "▾" : "▸"}
              </span>
            </button>
            <div
              className="faq-a"
              role="region"
              aria-hidden={open === i ? "false" : "true"}
            >
              {f.a}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
