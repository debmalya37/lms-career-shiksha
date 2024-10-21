import Link from 'next/link';

const AdminPanel = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Live Stream Section */}
        <Link href="/admin/live-classes" className="bg-blue-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Live Classes</h2>
        </Link>

        {/* Tutorial Section */}
        <Link href="/admin/tutorials" className="bg-green-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Tutorials</h2>
        </Link>

        {/* Notes Section */}
        <Link href="/admin/notes" className="bg-purple-600 text-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold">Manage Notes</h2>
        </Link>
      </div>
    </div>
  );
};

export default AdminPanel;
