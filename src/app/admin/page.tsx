import Link from 'next/link';

const AdminPanel = () => {
  return (
    <div className="min-h-screen bg-gray-200 p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Existing Sections */}
        <Link href="/admin/live-classes" className="bg-blue-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Live Classes</h2>
        </Link>
        <Link href="/admin/tutorials" className="bg-green-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Tutorials</h2>
        </Link>
        <Link href="/admin/notes" className="bg-purple-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Notes</h2>
        </Link>
        <Link href="/admin/userCreation" className="bg-yellow-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">User Creation</h2>
        </Link>
        <Link href="/admin/ebook" className="bg-orange-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage eBooks</h2>
        </Link>
        <Link href="/admin/question-paper" className="bg-red-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Question Papers</h2>
        </Link>
        <Link href="/admin/query" className="bg-indigo-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Queries</h2>
        </Link>
        <Link href="/admin/topics" className="bg-teal-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Topics</h2>
        </Link>
        <Link href="/admin/subjects" className="bg-gray-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Subjects</h2>
        </Link>
        <Link href="/admin/course" className="bg-red-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Courses</h2>
        </Link>
      </div>
    </div>
  );
};

export default AdminPanel;
