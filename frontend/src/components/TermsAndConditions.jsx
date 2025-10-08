import React from 'react';
import './LegalPages.css'; // Import the shared CSS

const TermsAndConditions = () => {
  return (
    <div className="legal-container">
      <h1>Terms and Conditions</h1>
      <p className="last-updated">Last updated: October 8, 2025</p>

      <h2>1. Introduction</h2>
      <p>
        Welcome to <strong>ConsultAI</strong>. These Terms and Conditions govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms.
      </p>

      <h2>2. Service Description</h2>
      <p>
        ConsultAI provides a platform to connect users with healthcare professionals for consultations and offers an AI-powered chat for informational purposes. <strong>Our services are not a substitute for professional medical advice, diagnosis, or treatment.</strong> Always seek the advice of your physician or other qualified health providers with any questions you may have regarding a medical condition.
      </p>

      <h2>3. User Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.
      </p>

      <h2>4. User Conduct</h2>
      <p>
        You agree not to use the service for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the service in any way that could damage the platform, services, or general business of ConsultAI.
      </p>

      <h2>5. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, in no event shall ConsultAI, its affiliates, directors, or employees, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
      </p>

      <h2>6. Governing Law</h2>
      <p>
        These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
      </p>

      <h2>7. Changes to Terms</h2>
      <p>
        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect.
      </p>

      <h2>8. Contact Us</h2>
      <p>
        If you have any questions about these Terms, please contact us at support@consultai.com.
      </p>
    </div>
  );
};

export default TermsAndConditions;