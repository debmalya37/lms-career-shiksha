"use client";
import Link from "next/link";
import { useState } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

export default function Contact() {
  const [fullName, setFullName] = useState("");
  const [interestCourse, setInterestCourse] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    // 1) Persist into our API
    try {
      await fetch("/api/user-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          interestCourse,
          message,
        }),
      });
      // (We ignore the response after we store it)
    } catch (err) {
      console.error("Failed to save query:", err);
      // You could show a toast or error message if you like
    } finally {
      setLoading(false);
      // 2) Then open the default mail client
      const mailtoLink = 
        `mailto:civilacademy.in@gmail.com?subject=Contact Us&body=` +
        `Name: ${encodeURIComponent(fullName)}%0D%0A` +
        `Phone: ${encodeURIComponent(phoneNumber)}%0D%0A` +
        `Interest Course: ${encodeURIComponent(interestCourse)}%0D%0A` +
        `Message: ${encodeURIComponent(message)}`;
      window.location.href = mailtoLink;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-sky-100 to-blue-200 px-4 py-10 flex flex-col items-center">
      {/* Heading Section */}
      <div className="text-center max-w-3xl mb-10 px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Get In Touch</h1>
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
          We’ll create high-quality linkable content and build at least 40 high-authority links to each asset, paving the way for you to grow your rankings, improve brand.
        </p>
      </div>

      {/* Contact Form Section */}
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl flex flex-col md:flex-row overflow-hidden">
        
        {/* Left: Contact Info */}
        <div className="bg-blue-500 text-white w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Contact Information</h2>
            <p className="text-sm mb-6">
              If you have any questions, feel free to reach out!
            </p>
            <div className="flex items-center mb-4">
              <FaPhone className="mr-3 -scale-x-100" />
              <a href="tel:+916398761583" className="hover:underline">
                +91 63987 61583
              </a>
            </div>
            <div className="flex items-start mb-6">
              <FaMapMarkerAlt className="mt-1 mr-3" />
              <span className="ml-2 h-fit w-fit text-left" >
            <Link
              href="https://www.google.com/maps?q=Career+Shiksha+IAS+PCS+GMS+Road+Dehradun"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline ml-2 align-left text-left"
            >
              Dehradun Centre - Civil Academy IAS/PCS, GMS Road, above Kotak Mahindra Bank, near Ballupur, Dehradun
              {/* <span>Dehradun Centre - Civil Academy IAS/PCS, GMS Road, above Kotak Mahindra Bank, near Ballupur, Dehradun Mob - 6398761583</span> */}
              </Link>
              </span>
            </div>
          </div>

          <div>
            <hr className="my-4 border-white/50" />
            <div className="flex items-center mb-4">
              <FaPhone className="mr-3 -scale-x-100" />
              <a href="tel:+919927827825" className="hover:underline">
                +91 99278 27825
              </a>
            </div>
            <div className="flex items-start mb-4">
              <FaMapMarkerAlt className="mt-1 mr-3" />
              <span className="ml-2 h-fit w-fit text-left">
              <Link
    href="https://www.google.com/maps?q=Career+Shiksha+IAS+PCS+Bachcha+Park+Meerut"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:underline ml-2 text-left"
  >
              Meerut Centre - Civil Academy IAS/PCS, 2nd Flr, Star Plaza, Bachcha Park, Meerut
              </Link>
              </span>
            </div>
          </div>

          {/* Decorative Circle */}
          <div className="mt-10 rounded-full w-36 h-36 bg-white/20 self-center blur-sm hidden sm:block"></div>
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name and Phone - Stack on small screens */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/2">
                <label className="block text-gray-700 text-sm mb-1">Your Name</label>
                <input
                title="Please enter your full name"
                  autoComplete="name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full border-b border-gray-400 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="w-full sm:w-1/2">
                <label className="block text-gray-700 text-sm mb-1">Phone Number</label>
                <input
                  type="tel"
                  title="Please enter your phone number"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full border-b border-gray-400 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Course */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">Interested Course / Subject</label>
              <input
                type="text"
                title="Please enter the course or subject you are interested in"
                autoComplete="course"
                value={interestCourse}
                onChange={(e) => setInterestCourse(e.target.value)}
                required
                className="w-full border-b border-gray-400 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-blue-500 font-medium text-sm mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Write here your message 👋"
                required
                className="w-full border-b border-blue-300 py-2 focus:outline-none focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white font-semibold py-2 rounded-md transition duration-300`}
            >
              {loading ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
