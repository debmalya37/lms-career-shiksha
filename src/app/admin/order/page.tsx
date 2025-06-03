// app/admin/order/page.tsx
"use client";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      console.log("data of orders:",data)
      setOrders(data);
    };
    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Course Purchases</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3 border">User</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Course</th>
              <th className="p-3 border">Amount</th>
              <th className="p-3 border">Transaction ID</th>
              <th className="p-3 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="p-3 border">{order.userName}</td>
                <td className="p-3 border">{order.userEmail}</td>
                <td className="p-3 border">{order.course.title}</td>
                <td className="p-3 border">₹{(order.amount / 100).toFixed(2)}</td>
                <td className="p-3 border">{order.transactionId}</td>
                <td className="p-3 border">
                  {new Date(order.purchasedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
