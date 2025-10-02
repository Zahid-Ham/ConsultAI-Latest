import React from "react";
import "./Testimonials.css"; // <-- Import the new CSS file

const testimonials = [
  {
    name: "Dr. Ayesha Khan",
    role: "Consultant Physician",
    text: "ConsultAI has revolutionized the way I connect with my patients. The platform is seamless and secure!",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Rahul Sharma",
    role: "Patient",
    text: "I got expert advice within minutes. The experience was truly premium and reassuring.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Dr. Priya Mehta",
    role: "Dermatologist",
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
            <div className="testimonial-content">
              <p className="testimonial-text">“{t.text}”</p>
              <span className="testimonial-name">{t.name}</span>
              <span className="testimonial-role">{t.role}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
