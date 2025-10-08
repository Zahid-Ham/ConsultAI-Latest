import React from 'react';
import './LegalPages.css'; // Import the shared CSS

const PrivacyPolicy = () => {
  return (
    <div className="legal-container">
      <h1>Privacy Policy</h1>
      <p className="last-updated">Last updated: October 8, 2025</p>

      <h2>1. Introduction</h2>
      <p>
        Your privacy is important to us. This Privacy Policy explains how <strong>ConsultAI</strong> collects, uses, discloses, and safeguards your information when you use our platform.
      </p>

      <h2>2. Information We Collect</h2>
      <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
      <ul>
        <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register with the Site.</li>
        <li><strong>Health Information:</strong> Information related to your health, medical history, and consultations, which is treated with the highest level of confidentiality.</li>
        <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
      </ul>

      <h2>3. Use of Your Information</h2>
      <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
      <ul>
        <li>Create and manage your account.</li>
        <li>Facilitate consultations with healthcare providers.</li>
        <li>Email you regarding your account or order.</li>
        <li>Anonymize data for statistical analysis and improvement of our services.</li>
      </ul>

      <h2>4. Disclosure of Your Information</h2>
      <p>We do not share, sell, rent or trade your personal information with third parties for their commercial purposes. We may share information we have collected about you in certain situations, such as with medical professionals you choose to consult with, or if required by law.</p>

      <h2>5. Security of Your Information</h2>
      <p>
        We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
      </p>

      <h2>6. Your Rights</h2>
      <p>You have the right to access, correct, or delete your personal data. You can usually do this through your account settings or by contacting us directly.</p>

      <h2>7. Contact Us</h2>
      <p>
        If you have questions or comments about this Privacy Policy, please contact us at privacy@consultai.com.
      </p>
    </div>
  );
};

export default PrivacyPolicy;