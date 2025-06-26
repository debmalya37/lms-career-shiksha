// src/app/admin/pre-admissions/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { IPreAdmission } from "@/models/preAdmissionModel";
import { ICourse } from "@/models/courseModel";

interface Summary {
  total: number;
  byGender: Record<string, number>;
  byState: Record<string, number>;
  byCourse: Record<string, number>;
}

export default function PreAdmissionsAdminPage() {
  const [records, setRecords] = useState<IPreAdmission[]>([]);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    byGender: {},
    byState: {},
    byCourse: {},
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // 1) fetch pre-admissions
        const { data: preads } = await axios.get<IPreAdmission[]>("/api/pre-admission");
        setRecords(preads);

        // 2) fetch courses to map titles
        const { data: allCourses } = await axios.get<ICourse[]>("/api/course");
        setCourses(allCourses);

        // 3) build summary
        const s: Summary = {
          total: preads.length,
          byGender: {},
          byState: {},
          byCourse: {},
        };
        preads.forEach(r => {
          s.byGender[r.gender] = (s.byGender[r.gender] || 0) + 1;
          s.byState[r.state] = (s.byState[r.state] || 0) + 1;
          const title = 
            allCourses.find(c => c._id === r.courseId.toString())?.title ||
            r.courseId.toString();
          s.byCourse[title] = (s.byCourse[title] || 0) + 1;
        });
        setSummary(s);
      } catch (err) {
        console.error("Failed to load pre-admissions or courses", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p className="p-8 text-center">Loading…</p>;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Pre-Admission Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Total Submissions</h2>
          <p className="mt-2 text-4xl">{summary.total}</p>
        </div>

        {/* By Gender */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">By Gender</h2>
          <ul className="mt-2 space-y-1">
            {Object.entries(summary.byGender).map(([g, count]) => (
              <li key={g}>
                <span className="font-medium">{g}:</span> {count}
              </li>
            ))}
          </ul>
        </div>

        {/* By State */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">By State</h2>
          <ul className="mt-2 space-y-1 max-h-40 overflow-auto">
            {Object.entries(summary.byState).map(([st, count]) => (
              <li key={st}>
                <span className="font-medium">{st}:</span> {count}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* By Course */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">By Course</h2>
        <ul className="space-y-1">
          {Object.entries(summary.byCourse).map(([title, count]) => (
            <li key={title} className="flex justify-between">
              <span>{title}</span>
              <span className="font-medium">{count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Course</th>
              <th className="px-4 py-2 text-left">State</th>
              <th className="px-4 py-2 text-left">City</th>
              <th className="px-4 py-2 text-left">Txn. ID</th>
            </tr>
          </thead>
          {/* ... */}
<tbody>
  {records.map((r) => {
    const key = String(r._id); // <-- ensure string
    const courseTitle =
      courses.find(c => c._id === String(r.courseId))?.title ||
      String(r.courseId);

    return (
      <tr key={key} className="border-t">
        <td className="px-4 py-2 text-sm">
          {new Date(r.createdAt).toLocaleDateString()}
        </td>
        <td className="px-4 py-2 text-sm">{r.name}</td>
        <td className="px-4 py-2 text-sm">{r.email}</td>
        <td className="px-4 py-2 text-sm">{r.phone}</td>
        <td className="px-4 py-2 text-sm">{courseTitle}</td>
        <td className="px-4 py-2 text-sm">{r.state}</td>
        <td className="px-4 py-2 text-sm">{r.city}</td>
        <td className="px-4 py-2 text-sm">{r.transactionId}</td>
      </tr>
    );
  })}
</tbody>
{/* ... */}

        </table>
      </div>
    </div>
  );
}
