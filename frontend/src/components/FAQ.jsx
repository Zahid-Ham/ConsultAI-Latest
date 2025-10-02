import React from "react";
import "./FAQ.css"; // <-- Import the new CSS file

const faqs = [
  {
    q: "What is ConsultAI?",
    a: "ConsultAI is an advanced healthcare platform that connects patients with verified doctors for secure, AI-powered consultations.",
  },
  {
    q: "How does ConsultAI ensure privacy?",
    a: "We use industry-leading encryption and privacy protocols to keep your medical data safe and confidential.",
  },
  {
    q: "Who can use ConsultAI?",
    a: "ConsultAI is designed for both patients seeking medical advice and doctors looking to offer online consultations.",
  },
  {
    q: "Is ConsultAI free to use?",
    a: "ConsultAI offers free basic access for patients. Some advanced features may require a subscription or payment.",
  },
  {
    q: "How do I get started?",
    a: "Simply register for an account, complete your profile, and start exploring our features.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = React.useState(null);
  const toggle = (idx) => setOpenIndex(openIndex === idx ? null : idx);
  return (
    <section className="faq-section">
      <h2 className="section-title">Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqs.map((item, i) => (
          <div className="faq-item" key={i}>
            <button className="faq-question" onClick={() => toggle(i)}>
              {item.q}
              <span className={`faq-arrow ${openIndex === i ? "open" : ""}`}>▼</span>
            </button>
            {openIndex === i && <div className="faq-answer">{item.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
