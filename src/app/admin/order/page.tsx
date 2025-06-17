"use client";
import { useEffect, useState, useMemo } from "react";

type Order = {
  userName: string;
  userEmail: string;
  course: { id: string; title: string; description?: string };
  amount: number;
  transactionId: string;
  purchasedAt: string;
};

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      // Sort by purchasedAt (latest first)
      const sorted = data.sort(
        (a: Order, b: Order) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
      );
      setOrders(sorted);
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) =>
      [order.userName, order.userEmail, order.course.title, order.transactionId]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [orders, search]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">All Course Purchases</h1>

      {/* Search Input */}
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="Search by user, email, course, or transaction ID..."
          className="border border-gray-300 px-4 py-2 rounded-md shadow-sm w-full max-w-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md shadow-md border border-gray-200">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">Course</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Transaction ID</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, i) => (
                <tr
                  key={i}
                  className="border-t hover:bg-gray-50 transition duration-150 ease-in-out"
                >
                  <td className="p-3 font-medium">{order.userName}</td>
                  <td className="p-3">{order.userEmail}</td>
                  <td className="p-3">{order.course.title}</td>
                  <td className="p-3">₹{(order.amount / 100).toFixed(2)}</td>
                  <td className="p-3">{order.transactionId}</td>
                  <td className="p-3">{new Date(order.purchasedAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-5 text-gray-500">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
