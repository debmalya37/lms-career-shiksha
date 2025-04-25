// src/app/privacy-policy/page.tsx
import React from "react";

export const metadata = {
  title: "Privacy Policy | Affordable Career Solutions",
  description:
    "Privacy Policy for Affordable Career Solutions LMS platform. We respect your privacy and outline how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="prose prose-lg max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1>Privacy Policy</h1>
      <p>
        Welcome to Affordable Career Solutions (“we”, “our”, “us”). Your privacy is
        critically important to us. This Privacy Policy explains how we collect,
        use, disclose, and safeguard your information when you visit our website or
        use our Learning Management System (LMS) platform.
      </p>

      <h2>1. Information We Collect</h2>
      <h3>1.1 Personal Information</h3>
      <p>
        When you register for an account or enroll in a course, we may collect
        personal information such as:
      </p>
      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>Payment details (processed securely via our payment gateway)</li>
      </ul>

      <h3>1.2 Usage Data</h3>
      <p>
        We automatically collect certain information when you visit or use our
        platform, including your IP address, browser type, pages visited, and
        device information. This helps us improve performance and user experience.
      </p>

      <h3>1.3 Cookies & Tracking</h3>
      <p>
        We use cookies and similar tracking technologies to track activity on our
        site and store certain information. You can instruct your browser to refuse
        all cookies or to indicate when a cookie is being sent.
      </p>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide and maintain our services;</li>
        <li>To process your course enrollments and payments;</li>
        <li>To communicate with you about your account, courses, and promotions;</li>
        <li>To personalize your experience and deliver content relevant to you;</li>
        <li>To detect, prevent, and address technical issues and fraud.</li>
      </ul>

      <h2>3. Sharing Your Information</h2>
      <p>
        We do not sell, trade, or rent your personal information to third parties.
        We may share information with:
      </p>
      <ul>
        <li>Service providers who help us operate our platform (e.g., payment processors, hosting providers);</li>
        <li>Government authorities when required by law;</li>
        <li>Our affiliates and business partners with your consent.</li>
      </ul>

      <h2>4. Data Security</h2>
      <p>
        We implement reasonable administrative, technical, and physical safeguards to
        protect your personal information. However, no method of transmission over
        the Internet or electronic storage is 100% secure.
      </p>

      <h2>5. Your Rights</h2>
      <p>
        Depending on your jurisdiction, you may have the right to:
      </p>
      <ul>
        <li>Access, correct, or delete your personal information;</li>
        <li>Object to or restrict our processing of your information;</li>
        <li>Withdraw consent at any time (where processing is based on consent).</li>
      </ul>
      <p>
        To exercise these rights, please contact us at the details below.
      </p>

      <h2>6. Children’s Privacy</h2>
      <p>
        Our services are not directed to children under 16. We do not knowingly
        collect personal information from children under 16. If you become aware
        that a child has provided us with personal information, please contact us.
      </p>

      <h2>7. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The “Last updated”
        date at the top will reflect when changes were made. Your continued use
        after changes constitutes acceptance of the new policy.
      </p>

      <h2>8. Contact Us</h2>
      <p>
        If you have any questions or concerns about this Privacy Policy, please
        reach out to us:
      </p>
      <ul>
        <li>
          <strong>Business Name:</strong> Affordable Career Solutions
        </li>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:affordablecareersolutions@gmail.com" className="text-blue-600">
            affordablecareersolutions@gmail.com
          </a>
        </li>
        <li>
          <strong>Phone:</strong> 92585-68451
        </li>
      </ul>
    </main>
  );
}
