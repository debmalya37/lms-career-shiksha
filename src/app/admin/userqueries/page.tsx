// app/admin/userqueries/page.tsx
import connectMongo from "@/lib/db";
import UserQueryModel from "../../../models/userQueryModel";
import { UserQuery } from "../../../models/userQueryModel";

export const dynamic = "force-dynamic";

export default async function UserQueriesPage() {
  // 1) Connect to MongoDB
  await connectMongo();

  // 2) Fetch all queries, sorted by newest first
  const queries = await UserQueryModel.find()
    .sort({ createdAt: -1 })
    .lean<UserQuery[]>();

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">User Queries</h1>
      {queries.length === 0 ? (
        <p className="text-gray-500">No queries found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Interested Course</th>
                <th className="px-4 py-2">Message</th>
                <th className="px-4 py-2">Date Submitted</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((q) => (
                <tr key={String(q._id)} className="border-t">
                  <td className="px-4 py-2">{q.fullName}</td>
                  <td className="px-4 py-2">{q.phoneNumber}</td>
                  <td className="px-4 py-2">{q.interestCourse}</td>
                  <td className="px-4 py-2">{q.message}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {new Date(q.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
