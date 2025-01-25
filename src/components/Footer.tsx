export default function Footer() {
  return (
    <footer className="bg-green-800 text-white py-8 mt-8">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        {/* About Section */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">About Civil Academy</h3>
          <p className="text-sm text-gray-300 mx-auto max-w-2xl">
            Civil Academy is dedicated to providing quality education and training. 
            We offer a range of courses designed to help students excel in their careers.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6 mx-auto max-w-4xl"></div>

        {/* Copyright */}
        <div className="text-sm text-gray-400">
          <p>&copy; 2024 Civil Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
