import React from "react";

const testimonials = [
  {
    name: "Dr. Ayesha Khan",
    role: " Consultant Physician",
    text: "ConsultAI has revolutionized the way I connect with my patients. The platform is seamless and secure!",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Rahul Sharma",
    role: " Patient",
    text: "I got expert advice within minutes. The experience was truly premium and reassuring.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Dr. Priya Mehta",
    role: " Dermatologist",
    text: "The AI-powered features help me deliver better care. Highly recommended for all healthcare professionals!",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <h2 className="section-title">What Our Users Say</h2>
      <div className="testimonials-list">
        {testimonials.map((t, i) => (
          <div className="testimonial-card" key={i}>
            <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
            <div className="testimonial-content" style={{ color: "var(--card-text)" }}>
              <p className="testimonial-text" style={{ color: "var(--card-text)" }}>“{t.text}”</p>
              <span className="testimonial-name" style={{ color: "var(--accent)", fontWeight: 700 }}>{t.name}</span>
              <span className="testimonial-role" style={{ color: "var(--card-text)", opacity: 0.7 }}>{t.role}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
