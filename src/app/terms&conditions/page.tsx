// src/app/terms/page.tsx
import React from 'react';
import Head from 'next/head';

export const metadata = {
  title: 'Terms & Conditions – AffordableCareerSolutions',
  description: 'Terms, Privacy Policy and Refund & Return policy for AffordableCareerSolutions',
};

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms & Conditions – AffordableCareerSolutions</title>
        <meta name="description" content="Terms, Privacy Policy and Refund & Return policy for AffordableCareerSolutions" />
      </Head>

      <main className="bg-gray-50 text-gray-800 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
            <p>
              Welcome to AffordableCareerSolutions. By accessing or using our website, you agree to be bound by these Terms &amp; Conditions
              and our Privacy Policy. If you do not agree, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">2. Educational Content</h2>
            <p>
              All courses, materials, and content provided by AffordableCareerSolutions are for educational purposes only. We make every
              effort to ensure accuracy, but we do not guarantee results.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">3. User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>You are responsible for providing accurate information when registering.</li>
              <li>Respect copyright and do not redistribute our materials without permission.</li>
              <li>Use the platform in compliance with all applicable laws.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">4. Privacy Policy</h2>
            <p>
              We collect and process your personal data in accordance with our Privacy Policy. Please review it below to understand how
              we handle your information.
            </p>
            <h3 className="text-xl font-medium mt-4">Privacy Policy</h3>
            <p>
              <strong>Information We Collect:</strong> Name, email, phone number, course progress, and payment details.
            </p>
            <p>
              <strong>How We Use It:</strong> To provide and improve our services, process payments, and send you updates.
            </p>
            <p>
              <strong>Data Sharing:</strong> We will never sell your personal information. We may share with service providers who help
              us operate the site (e.g. payment gateway, hosting).
            </p>
            <p>
              <strong>Your Rights:</strong> You may request access, correction, or deletion of your personal data by contacting us at
              <a href="mailto:affordablecareersolutions@gmail.com" className="text-blue-600 hover:underline"> affordablecareersolutions@gmail.com</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">5. Refund &amp; Return Policy</h2>
            <p>
              <strong>We do not entertain any refund or return requests.</strong> All sales of educational courses are final. By
              purchasing you acknowledge that you have read and agreed to this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">6. Limitation of Liability</h2>
            <p>
              AffordableCareerSolutions and its affiliates shall not be liable for any indirect, incidental, or consequential damages
              arising from your use of our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">7. Contact Us</h2>
            <p>If you have any questions about these terms, please contact us:</p>
            <ul className="list-inside list-none space-y-1 mt-2">
              <li><strong>Business Name:</strong> AffordableCareerSolutions</li>
              <li>
                <strong>Email:</strong>{' '}
                <a href="mailto:affordablecareersolutions@gmail.com" className="text-blue-600 hover:underline">
                  affordablecareersolutions@gmail.com
                </a>
              </li>
              <li><strong>Phone:</strong> 92585-68451</li>
            </ul>
          </section>

          <p className="text-sm text-gray-500 mt-12">
            © {new Date().getFullYear()} AffordableCareerSolutions. All rights reserved.
          </p>
        </div>
      </main>
    </>
  );
}
