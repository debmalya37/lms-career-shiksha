// app/admin/promocode/page.tsx
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "@/components/AdminSideBar";

interface Promo {
  _id: string;
  code: string;
  discountType: "percentage" | "amount";
  discountValue: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  applicableCourses: { _id: string; title: string }[];
}
interface Course { _id: string; title: string; }

export default function PromoAdminPage() {
  const [list, setList] = useState<Promo[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    expiresAt: "",
    usageLimit: 1,
    applicableCourses: [] as string[]
  });

  useEffect(() => {
    axios.get<Course[]>('/api/course').then(res => setCourses(res.data));
    axios.get<Promo[]>('/api/promocodes').then(res => setList(res.data));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('/api/promocodes', form);
    setForm(f => ({ ...f, code: '', applicableCourses: [] }));
    const res = await axios.get<Promo[]>('/api/promocodes');
    setList(res.data);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Manage Promo-Codes</h1>
      <form onSubmit={submit} className="grid gap-4">
        <input required placeholder="Code"
          value={form.code}
          onChange={e=>setForm(f=>({...f, code:e.target.value.toUpperCase()}))}
          className="border p-2 rounded" />

        <div className="flex space-x-2">
          {/* discountType & discountValue inputs */}
          <label htmlFor="discountType" className="sr-only">Discount Type</label>
          <select
            id="discountType"
            value={form.discountType}
            onChange={e=>setForm(f=>({...f, discountType:e.target.value as any}))}
            className="border p-2 rounded flex-1">
            <option value="percentage">Percentage</option>
            <option value="amount">Fixed Amount</option>
          </select>
          <input type="number" required
            value={form.discountValue}
            onChange={e=>setForm(f=>({...f, discountValue: parseFloat(e.target.value)}))}
            className="border p-2 rounded w-32"
            placeholder="Value" />
        </div>

        <div className="flex space-x-2">
          <input type="date" required
            placeholder="Expires At"
            value={form.expiresAt}
            onChange={e=>setForm(f=>({...f, expiresAt:e.target.value}))}
            className="border p-2 rounded flex-1" />
          <input type="number" required min={1}
            placeholder="Usage Limit"
            value={form.usageLimit}
            onChange={e=>setForm(f=>({...f, usageLimit: parseInt(e.target.value)}))}
            className="border p-2 rounded w-32" />
        </div>

        {/* Multi-select for Applicable Courses */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Applicable Courses (leave empty for general)
          </label>
          <select
            id="applicableCourses"
            name="applicableCourses"
            title="Select applicable courses"
            multiple
            value={form.applicableCourses}
            onChange={e => {
              const opts = Array.from(e.target.selectedOptions).map(o => o.value);
              setForm(f => ({ ...f, applicableCourses: opts }));
            }}
            className="border p-2 rounded w-full h-32"
          >
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Promo Code
        </button>
      </form>

      {/* existing table listing codes */}
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            {["Code","Type","Value","Applicable Courses","Expires","Used/Limit"].map(h=>(
              <th key={h} className="border px-2 py-1 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map(p=>(
            <tr key={p._id} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{p.code}</td>
              <td className="border px-2 py-1">{p.discountType}</td>
              <td className="border px-2 py-1">{p.discountValue}</td>
              <td className="border px-2 py-1">
  {Array.isArray(p.applicableCourses)
    ? (p.applicableCourses as any[]).map(c => c.title).join(", ")
    : ""}
</td>

              <td className="border px-2 py-1">{new Date(p.expiresAt).toLocaleDateString()}</td>
              <td className="border px-2 py-1">{p.usedCount}/{p.usageLimit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}