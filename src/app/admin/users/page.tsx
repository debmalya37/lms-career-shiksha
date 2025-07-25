// File: app/admin/users/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IAdmission } from '@/models/admissionModel';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip
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
import { AdmissionFormPreview } from '@/components/AdmissionFormPreview';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend
);

interface CourseProgress {
  courseId:    string;
  title:       string;
  duration:    number;       // total days
  purchasedAt: string | null;
  daysLeft:    number | null;
}

interface User {
  _id:             string;
  name:            string;
  email:           string;
  phoneNo?:        string;
  subscription?:   number;
  purchaseHistory: { amount: number; purchasedAt: string }[];
  createdAt:       string;
  courseProgress:  CourseProgress[];
}

interface Admission {
  _id: string;
  courseTitle: string;
  courseId: string;
  profileImageUrl: string;
  aadhaarFrontUrl: string;
  aadhaarBackUrl: string;
  aadhaarNumber: string;
  name: string;
  fatherName: string;
  dob: string;
  address1: string;
  address2: string;
  state: string;
  city?: string;
  transactionId: string;
  createdAt: string;
  email?: string;
  phone?: string;
}

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  usersByCourse: Record<string, number>;
  revenueByUser: { userId: string; name: string; revenue: number }[];
}

export default function UserAdminPage() {
  // core data
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [admissions, setAdmissions] = useState<Array<IAdmission & { _id: string }>>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  // UI state
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter]   = useState<string>('All');
  const [courseFilter, setCourseFilter] = useState<string>('All');
  const [openRows, setOpenRows]         = useState<Record<string,boolean>>({});
  const [previewAdmission,setPreviewAdmission] = useState<Admission | null>(null);
  const [busyId, setBusyId]           = useState<string|null>(null);

  // fetch users + stats
  useEffect(() => {
    fetch('/api/admin/users', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        setStats(data.stats);
        setUsers(data.users);
      });
  }, []);

  // fetch admissions + invoices
  useEffect(() => {
    fetch('/api/admission')
      .then(r => r.json())
      .then(setAdmissions);
    fetch('/api/invoices')
      .then(r => r.json())
      .then(({ invoices }) => setInvoices(invoices));
  }, []);

  if (!stats) return <p className="p-8 text-center">Loading…</p>;

  // Charts data omitted for brevity...
   // — Admissions by state chart data —
   const stateCounts = admissions.reduce<Record<string,number>>((acc, a) => {
    acc[a.state] = (acc[a.state] || 0) + 1;
    return acc;
  }, {});
  const stateBarData = {
    labels: Object.keys(stateCounts),
    datasets: [{
      label: 'Admissions',
      data: Object.values(stateCounts),
      backgroundColor: '#8B5CF6',
      borderColor:     '#6B21A8',
      borderWidth: 1,
    }]
  };
  const stateBarOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' as const }, title: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  // — Users by course chart data —
  const courseLabels = Object.keys(stats.usersByCourse);
  const courseCounts = Object.values(stats.usersByCourse);
  const courseBarData = {
    labels: courseLabels,
    datasets: [{
      label: 'Users',
      data: courseCounts,
      backgroundColor: '#8B5CF6',
      borderColor:     '#6B21A8',
      borderWidth: 1,
    }]
  };
  const courseBarOptions = { 
    responsive: true,
    plugins: { legend: { position: 'bottom' as const }, title: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  // — Subscription pie chart data —
  const subsData = [
    { name: 'Active',  value: stats.activeSubscriptions },
    { name: 'Expired', value: stats.expiredSubscriptions },
  ];
  const COLS = ['#4ade80','#f87171'];

  // Filters UI
  const allStates  = Array.from(new Set(admissions.map(a=>a.state)));
  // for courseFilter dropdown we use stats.usersByCourse keys
  const allCourses = Object.keys(stats.usersByCourse);

  // apply search + filters
  const visibleUsers = users
    .filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
    .filter(u =>
      stateFilter === 'All' ||
      admissions.some(a => a.email === u.email && a.state === stateFilter)
    )
    .filter(u =>
      courseFilter === 'All' ||
      u.courseProgress.some(cp => cp.title === courseFilter)
    );

  // PDF download handler omitted...

   // ---- dynamic invoice PDF download ----
   const handleDownload = async (inv: any) => {
    try {
      setBusyId(inv._id);
      // dynamic import to avoid prerender-time ESM require
      const [{ pdf, Font }, { InvoiceDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/InvoiceDocument')
      ]);

      Font.register({
        family: 'Poppins',
        fonts: [
          { src: '/fonts/Poppins-Regular.ttf' },
          { src: '/fonts/Poppins-Bold.ttf', fontWeight: 'bold' },
        ],
      });

      const blob = await pdf(
        <InvoiceDocument invoice={{ ...inv, pincode: inv.pincode ?? 0 }} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                    (window.navigator as any).standalone === true;

      if (isPWA) {
        window.open(url, '_blank');
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${inv.invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) {
      console.error('PDF generation error', e);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setBusyId(null);
    }
  };
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">User Management Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          ['Total Users',      stats.totalUsers],
          ['Active Subs',      stats.activeSubscriptions],
          ['Expired Subs',     stats.expiredSubscriptions],
        ].map(([title,value])=>(
          <div key={title} className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-3xl">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">Users by Course</h3>
          <Bar data={courseBarData} options={courseBarOptions} />
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">Subscription Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={subsData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} label>
                {subsData.map((_,i)=><Cell key={i} fill={COLS[i]} />)}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded shadow lg:col-span-2">
          <h3 className="text-xl font-semibold mb-4">Admissions by State</h3>
          <Bar data={stateBarData} options={stateBarOptions} />
        </div>
      </div>


      {/* Filters */}
      <div className="flex space-x-4">
        <input
          type="text"
          placeholder="Search users…"
          value={search}
          onChange={e=>setSearch(e.target.value)}
          className="border px-3 py-2 rounded flex-1"
        />
        <select
        title='Filter by state'
          value={stateFilter}
          onChange={e=>setStateFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option>All</option>
          {allStates.map(s => <option key={s}>{s}</option>)}
        </select>
        <select
        title='Filter by course'
          value={courseFilter}
          onChange={e=>setCourseFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option>All</option>
          {allCourses.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* User table */}
      <div className="bg-white rounded shadow p-6 overflow-x-auto">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-100">
            <tr>
              {['Name','Email','Phone','#Courses','Courses & Time Left','Subscription','Revenue','Admissions','Invoices']
                .map(h => (
                  <th key={h} className="px-4 py-2 text-left">{h}</th>
                ))
              }
            </tr>
          </thead>
          <tbody>
  {visibleUsers.map((u, rowIdx) => {
    const myAdmissions = admissions.filter(a => a.email === u.email);
    const myInvoices   = invoices.filter(inv => inv.email === u.email);
    const isOpen       = !!openRows[u._id];

    return (
      <React.Fragment key={u._id}>
        <tr
          className={`
            hover:bg-indigo-50
            ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            transition
          `}
        >
          <td className="px-4 py-2 text-gray-800 font-medium">{u.name}</td>
          <td className="px-4 py-2 text-gray-700">{u.email}</td>
          <td className="px-4 py-2 text-gray-700">{u.phoneNo}</td>

          {/* #Courses */}
          <td className="px-4 py-2 text-center">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
              {u.courseProgress.length}
            </span>
          </td>

          {/* Courses & Time Left */}
          <td className="px-4 py-2 space-y-1">
            {u.courseProgress.map(cp => (
              <div
                key={cp.courseId}
                className="p-2 bg-white border-l-4 border-indigo-300 rounded shadow-sm"
              >
                <p className="font-semibold text-gray-800">{cp.title}</p>
                {cp.daysLeft !== null ? (
                  cp.daysLeft > 0 ? (
                    <p className="text-sm text-green-700">
                      {cp.daysLeft}d <span className="text-gray-500">/ {cp.duration}d</span>
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 font-semibold">Expired</p>
                  )
                ) : (
                  <p className="text-sm text-gray-500">Not purchased</p>
                )}
              </div>
            ))}
          </td>

          {/* Subscription */}
          <td className="px-4 py-2 text-center text-gray-700">
            {u.subscription ?? '—'}
          </td>

          {/* Revenue */}
          <td className="px-4 py-2 text-right text-indigo-600 font-semibold">
            ₹{(u.purchaseHistory.reduce((s,p) => s + p.amount, 0) / 100).toFixed(2)}
          </td>

          {/* Admissions */}
          <td className="px-4 py-2 text-center">
            <button
              onClick={() =>
                setOpenRows(prev => ({ ...prev, [u._id]: !isOpen }))
              }
              className="text-indigo-600 hover:underline"
            >
              {isOpen ? '▾' : '▸'} {myAdmissions.length}
            </button>
          </td>

          {/* Invoices */}
          <td className="px-4 py-2 text-center">
            <button
              onClick={() =>
                setOpenRows(prev => ({ ...prev, [u._id]: !isOpen }))
              }
              className="text-indigo-600 hover:underline"
            >
              {isOpen ? '▾' : '▸'} {myInvoices.length}
            </button>
          </td>
        </tr>

        {isOpen && (
          <tr>
            <td colSpan={9} className="bg-indigo-50 p-4">
              <div className="grid grid-cols-2 gap-6">
                {/* Admissions list */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Admissions</h4>
                  {myAdmissions.length > 0 ? (
                    myAdmissions.map(adm => (
                      <div
                        key={adm._id as string}
                        className="flex items-center justify-between mb-1 px-2 py-1 bg-white rounded shadow-xs"
                      >
                        <span className="text-gray-700">
                          {new Date(adm.createdAt).toLocaleDateString()} —{' '}
                          <span className="font-medium">{adm.courseId.toString()}</span>
                        </span>
                        <button
                          onClick={() => setPreviewAdmission(adm as any)}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          Preview
                        </button>
                      </div>
                    ))
                  ) : (
                    <em className="text-gray-500">No admissions</em>
                  )}
                </div>

                {/* Invoices list */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Invoices</h4>
                  {myInvoices.length > 0 ? (
                    myInvoices.map(inv => (
                      <div
                        key={inv._id}
                        className="flex items-center justify-between mb-1 px-2 py-1 bg-white rounded shadow-xs"
                      >
                        <span className="text-gray-700">
                          {inv.invoiceId} —{' '}
                          <span className="font-medium">
                            ₹{inv.totalAmount.toFixed(2)}
                          </span>
                        </span>
                        <button
                          onClick={() => handleDownload(inv)}
                          disabled={busyId === inv._id}
                          className={`px-2 py-1 rounded text-xs ${
                            busyId === inv._id
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          {busyId === inv._id ? 'Downloading…' : 'Download'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <em className="text-gray-500">No invoices</em>
                  )}
                </div>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  })}
</tbody>

        </table>
      </div>

      {/* Admission preview modal */}
      {previewAdmission && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg overflow-auto max-h-[90vh] max-w-full p-4 relative">
            <button
              onClick={() => setPreviewAdmission(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-xl font-bold"
            >
              &times;
            </button>
            <AdmissionFormPreview admission={previewAdmission} />
          </div>
        </div>
      )}
    </div>
  );
}
