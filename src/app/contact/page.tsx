"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function Contact() {
  const [fullName, setFullName] = useState('');
  const [interestCourse, setInterestCourse] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // New state for phone number
  const [message, setMessage] = useState('');

  const handleSubmit = (e:any) => {
    e.preventDefault();
    const mailtoLink = `mailto:Careersikshadev@gmail.com?subject=Contact Us&body=Name: ${fullName}%0D%0APhone: ${phoneNumber}%0D%0AInterest Course: ${interestCourse}%0D%0AMessage: ${message}`;
    window.location.href = mailtoLink; // Redirect to mailto link
  };

  return (
    <main className="bg-white min-h-screen p-8">
      <div className="container mx-auto max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Contact Us</h1>
        <p className="text-gray-700 text-center mb-4">If you have any questions, feel free to reach out!</p>
        <p className="text-center text-gray-600 mb-4">Phone: <span className="text-blue-600">+919258568451</span></p>

        <form onSubmit={handleSubmit} className="bg-green-100 p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 text-black"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 text-black"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="interestCourse" className="block text-sm font-medium text-gray-700">Interest Course</label>
            <input
              type="text"
              id="interestCourse"
              value={interestCourse}
              onChange={(e) => setInterestCourse(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 text-black"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 text-black"
              rows={4}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-500 transition duration-300"
          >
            Submit
          </button>
        </form>

        <p className="text-center text-gray-500 mt-4">We look forward to hearing from you!</p>
      </div>
    </main>
  );
}
