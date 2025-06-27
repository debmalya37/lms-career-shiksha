// File: app/admin/users/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend
);


interface User {
  _id: string;
  name: string;
  email: string;
  course: string[];
  subscription?: number;
  purchaseHistory: { amount: number; purchasedAt: string }[];
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  usersByCourse: Record<string, number>;
  revenueByUser: { userId: string; name: string; revenue: number }[];
}

export default function UserAdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/users', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        setStats(data.stats);
        setUsers(data.users);
      })
      .catch(console.error);
  }, []);

  if (!stats) return <p className="p-8 text-center">Loading…</p>;



  // Prepare data for charts
  const courseData = Object.entries(stats.usersByCourse).map(([name, count]) => ({ name, count }));
  const subsData = [
    { name: 'Active', value: stats.activeSubscriptions },
    { name: 'Expired', value: stats.expiredSubscriptions },
  ];
  const COLORS = ['#4ade80', '#f87171'];

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

    // Prepare chart.js data
    const labels   = Object.keys(stats.usersByCourse);
    const counts   = Object.values(stats.usersByCourse);
    const barData  = {
      labels,
      datasets: [
        {
          label: 'Users',
          data: counts,
          backgroundColor: '#8B5CF6',    // Tailwind purple-500
          borderColor:     '#6B21A8',    // Tailwind purple-700
          borderWidth: 1,
        },
      ],
    };
  
    const barOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' as const },
        title:  { display: false },
      },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">User Management Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="mt-2 text-3xl">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold">Active Subscriptions</h3>
          <p className="mt-2 text-3xl">{stats.activeSubscriptions}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold">Expired Subscriptions</h3>
          <p className="mt-2 text-3xl">{stats.expiredSubscriptions}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">Users by Course</h3>
          <Bar data={barData} options={barOptions} />
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">Subscription Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={subsData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                label
              >
                {subsData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">All Users</h2>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-100">
              <tr>
                {['Name','Email','Courses', 'Course Title','Subscription','Revenue'].map(h => (
                  <th key={h} className="px-4 py-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                // compute expiry date
                const created = new Date(u.createdAt);
                const expDate = u.subscription
                  ? new Date(created).setDate(created.getDate() + u.subscription)
                  : null;
                return (
                  <tr key={u._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{u.name}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">{u.course.length}</td>
                    <td
                        className="px-4 py-2"
                        title={u.course.join(', ')}      // <-- native tooltip shows full list
                      >
                                  {u.course.join(', ')}

                      </td>
                    <td className="px-4 py-2">
                      {/* {expDate
                        ? new Date(expDate).toLocaleDateString()
                        : '—'} */} {u.subscription}
                    </td>
                    <td className="px-4 py-2 font-medium">
                    ₹{(((u.purchaseHistory ?? []) as { amount: number }[])
                        .reduce((sum, p) => sum + p.amount, 0) ) // assuming amount is in rupees already by phonpe/check api /100
                        .toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
