// src/app/admin/pre-admissions/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface ILeanPreAdmission {
  _id:        string;
  courseId:   string;
  email:      string;
  name:       string;
  gender:     "male" | "female" | "other";
  phone:      string;
  fatherName: string;
  address1:   string;
  address2?:  string;
  pincode:    string;
  state:      string;
  city:       string;
  createdAt:  string;
  updatedAt:  string;
}

interface ICourse {
  _id:             string;
  title:           string;
  // ... any other fields you need
}

interface Summary {
  total: number;
  byGender:  Record<string, number>;
  byState:   Record<string, number>;
  byCourse:  Record<string, number>;
}

interface EnrichedPreAdmission extends ILeanPreAdmission {
  transactionId: string | null;
}

export default function PreAdmissionsAdminPage() {
  const [records, setRecords]   = useState<EnrichedPreAdmission[]>([]);
  const [courses, setCourses]   = useState<ICourse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [summary, setSummary]   = useState<Summary>({
    total:    0,
    byGender: {},
    byState:  {},
    byCourse: {},
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 1) raw pre-admissions
        const { data: raw } = await axios.get<ILeanPreAdmission[]>("/api/pre-admission");
        // 2) all courses
        const { data: allCourses } = await axios.get<ICourse[]>("/api/course");
        setCourses(allCourses);

        // 3) enrich with transactionId
        const enrichedAll = await Promise.all<EnrichedPreAdmission>(
          raw.map(async (r) => {
            const resp = await axios.get<{ transactionId: string | null }>(
              `/api/pre-admission/txn?email=${encodeURIComponent(r.email)}&courseId=${encodeURIComponent(r.courseId)}`
            );
            return { ...r, transactionId: resp.data.transactionId };
          })
        );

        // 4) dedupe by transactionId (if txn is null we keep every record)
        const seen = new Set<string>();
        const enriched = enrichedAll.filter((r) => {
          if (!r.transactionId) {
            return true; // keep any “pending” record
          }
          if (seen.has(r.transactionId)) {
            return false;
          }
          seen.add(r.transactionId);
          return true;
        });

        setRecords(enriched);

        // 5) rebuild your summary against `enriched`
        const s: Summary = {
          total: enriched.length,
          byGender: {},
          byState: {},
          byCourse: {},
        };
        enriched.forEach((r) => {
          s.byGender[r.gender] = (s.byGender[r.gender] || 0) + 1;
          s.byState[r.state]   = (s.byState[r.state]   || 0) + 1;
          const title =
            allCourses.find((c) => c._id === r.courseId)?.title || r.courseId;
          s.byCourse[title]   = (s.byCourse[title]   || 0) + 1;
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

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Total Submissions</h2>
          <p className="mt-2 text-4xl">{summary.total}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">By Gender</h2>
          <ul className="mt-2 space-y-1">
            {Object.entries(summary.byGender).map(([g, c]) => (
              <li key={g}><strong>{g}:</strong> {c}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">By State</h2>
          <ul className="mt-2 space-y-1 max-h-40 overflow-auto">
            {Object.entries(summary.byState).map(([st, c]) => (
              <li key={st}><strong>{st}:</strong> {c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* By Course */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">By Course</h2>
        <ul className="space-y-1">
          {Object.entries(summary.byCourse).map(([title, c]) => (
            <li key={title} className="flex justify-between">
              <span>{title}</span>
              <span className="font-medium">{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              {["Date","Name","Email","Phone","Course","State","City","Txn. ID","Status"]
                .map(col => <th key={col} className="px-4 py-2 text-left">{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const paid = Boolean(r.transactionId);
              const courseTitle =
                courses.find(c => c._id === r.courseId)?.title ||
                r.courseId;
              return (
                <tr key={r._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm">{r.name}</td>
                  <td className="px-4 py-2 text-sm">{r.email}</td>
                  <td className="px-4 py-2 text-sm">{r.phone}</td>
                  <td className="px-4 py-2 text-sm">{courseTitle}</td>
                  <td className="px-4 py-2 text-sm">{r.state}</td>
                  <td className="px-4 py-2 text-sm">{r.city}</td>
                  <td className="px-4 py-2 text-sm">
                    {r.transactionId || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {paid
                      ? <span className="text-green-600 font-semibold">✅ Paid</span>
                      : <span className="text-orange-600 font-semibold">⏳ Pending</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
