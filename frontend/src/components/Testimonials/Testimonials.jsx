import "./Testimonials.css";

const sample = [
  {
    name: "Aisha K.",
    role: "Regular customer",
    text: "Great flavors and fast delivery. The reservation process was smooth and the staff friendly!",
  },
  {
    name: "Marco P.",
    role: "Food lover",
    text: "Loved the ambience. Ordered online and the food arrived hot. Highly recommended.",
  },
  {
    name: "Leena S.",
    role: "Frequent diner",
    text: "Easy booking and tasty dishes. The online menu made choosing simple.",
  },
];

const Testimonials = () => {
  return (
    <section className="testimonials" aria-labelledby="testi-title">
      <h3 id="testi-title">What our customers say</h3>
      <div className="testi-grid">
        {sample.map((s, i) => (
          <article
            key={i}
            className="testi-card"
            aria-label={`testimonial ${i + 1}`}
          >
            <div className="testi-stars" aria-hidden>
              <span>★★★★★</span>
            </div>
            <p className="testi-text">{s.text}</p>
            <div className="testi-meta">
              <div className="testi-avatar" aria-hidden>
                {/* placeholder circle avatar */}
              </div>
              <div className="testi-person">
                <div className="testi-name">{s.name}</div>
                <div className="testi-role">{s.role}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
