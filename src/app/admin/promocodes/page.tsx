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
}

export default function PromoAdminPage() {
  const [list, setList] = useState<Promo[]>([]);
  const [form, setForm] = useState({
    code: "", discountType: "percentage", discountValue: 0,
    expiresAt: "", usageLimit: 1
  });

  const fetch = async () => {
    const res = await axios.get<Promo[]>("/api/promocodes");
    setList(res.data);
  };
  useEffect(() => { fetch(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post("/api/promocodes", form);
    setForm({ ...form, code: "" });
    fetch();
  };

  return (
   
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Manage Promo-Codes</h1>
      <form onSubmit={submit} className="grid grid-cols-1 gap-4">
        <input required placeholder="Code"
          value={form.code}
          onChange={e=>setForm(f=>({...f, code:e.target.value}))}
          className="border p-2 rounded" />
        <div className="flex space-x-2">
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
            value={form.expiresAt}
            onChange={e=>setForm(f=>({...f, expiresAt:e.target.value}))}
            className="border p-2 rounded flex-1"
            placeholder="Expiration Date" />
          <input type="number" required min={1}
            value={form.usageLimit}
            onChange={e=>setForm(f=>({...f, usageLimit: parseInt(e.target.value)}))}
            className="border p-2 rounded w-32"
            placeholder="Limit" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
      </form>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            {["Code","Type","Value","Expires","Used/Limit"].map(h=>(
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
              <td className="border px-2 py-1">{new Date(p.expiresAt).toLocaleDateString()}</td>
              <td className="border px-2 py-1">{p.usedCount}/{p.usageLimit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
  );
}
