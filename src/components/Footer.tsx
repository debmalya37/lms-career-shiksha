export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* About Section */}
        <div className="mb-6">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">About Career Shiksha</h3>
          <p className="text-sm md:text-base text-gray-300 mx-auto max-w-2xl leading-relaxed">
          Career Shiksha is dedicated to providing quality education and training. 
            We offer a range of courses designed to help students excel in their careers.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-4 mx-auto max-w-4xl"></div>

        {/* Copyright */}
        <div className="text-sm text-gray-400">
          <p>&copy; 2024 Career Shiksha. All rights reserved.</p>
          <p className="text-center">Created by KRYPTAROID DIGITAL SOLUTIONS</p>
        </div>
      </div>
    </footer>
  );
}
