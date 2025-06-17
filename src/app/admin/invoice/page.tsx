"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiPlus, FiX } from "react-icons/fi";

interface CourseOption {
  _id: string;
  title: string;
  price: number;
  discountedPrice: number;
}

interface Invoice {
  _id: string;
  invoiceId: string;
  admissionFormId: string;
  studentName: string;
  fatherName: string;
  studentAddress: string;
  course: {
    id: string;
    title: string;
    originalPrice: number;
    discount: number;
    discountedPrice: number;
  };
  state: string;
  cgst: number;
  sgst: number;
  igst: number;
  taxAmount: number;
  totalAmount: number;
  transactionId: string;
  paymentMethod: string;
  createdAt: string;
}

export default function AdminInvoicesPage() {
  // Table & filter state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [gstTotal, setGstTotal] = useState(0);
  const [monthFilter, setMonthFilter] = useState("");

  // Modal open
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [admissionFormId, setAdmissionFormId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [stateName, setStateName] = useState("");
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [transactionId, setTransactionId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Online");

  // Tax breakdown
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [igst, setIgst] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Fetch invoices & GST total
  const fetchInvoices = async () => {
    const res = await axios.get(
      "/api/invoices" + (monthFilter ? `?month=${monthFilter}` : "")
    );
    setInvoices(res.data.invoices);
    setGstTotal(res.data.gstTotal);
  };

  // Fetch all courses once
  const fetchCourses = async () => {
    const res = await axios.get<CourseOption[]>("/api/course");
    setCourseOptions(res.data);
  };

  useEffect(() => {
    fetchInvoices();
  }, [monthFilter]);

  useEffect(() => {
    fetchCourses();
  }, []);

  // When course selection changes, auto‑fill prices
  useEffect(() => {
    const c = courseOptions.find((c) => c._id === selectedCourseId);
    if (c) {
      setOriginalPrice(c.price);
      setDiscountedPrice(c.discountedPrice);
    }
  }, [selectedCourseId, courseOptions]);

  // Recompute tax + total whenever discountedPrice or stateName changes
  useEffect(() => {
    const amt = discountedPrice;
    let _cgst = 0,
      _sgst = 0,
      _igst = 0;
    if (stateName.trim().toUpperCase() === "UP") {
      _cgst = amt * 0.09;
      _sgst = amt * 0.09;
    } else {
      _igst = amt * 0.18;
    }
    const _taxAmount = _cgst + _sgst + _igst;
    setCgst(_cgst);
    setSgst(_sgst);
    setIgst(_igst);
    setTaxAmount(_taxAmount);
    setTotalAmount(amt + _taxAmount);
  }, [discountedPrice, stateName]);

  // Create invoice
  const handleCreate = async () => {
    try {
      await axios.post("/api/invoices", {
        admissionFormId,
        studentName,
        fatherName,
        studentAddress,
        state: stateName,
        courseId: selectedCourseId,
        originalPrice,
        discountedPrice,
        cgst,
        sgst,
        igst,
        taxAmount,
        totalAmount,
        transactionId,
        paymentMethod,
      });
      setModalOpen(false);
      // reset form
      setAdmissionFormId("");
      setStudentName("");
      setFatherName("");
      setStudentAddress("");
      setStateName("");
      setSelectedCourseId("");
      setOriginalPrice(0);
      setDiscountedPrice(0);
      setTransactionId("");
      setPaymentMethod("Online");
      fetchInvoices();
    } catch (err) {
      console.error("Error creating invoice:", err);
      alert("Failed to create invoice");
    }
  };

  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Invoices</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
          >
            <FiPlus className="mr-2" /> Create Invoice
          </button>
          <input
            type="month"
            title="Filter by Month (YYYY-MM)"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <button
            onClick={fetchInvoices}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded"
          >
            Filter
          </button>
        </div>
      </div>

      {/* GST Total */}
      <div className="mb-6 p-4 bg-white rounded shadow">
        <span className="font-semibold">GST Collected:</span>{" "}
        <span className="text-indigo-600 font-bold">
          ₹{gstTotal.toFixed(2)}
        </span>
      </div>

      {/* Invoice Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Invoice ID",
                "Student",
                "Course",
                "Amount",
                "Tax",
                "Total",
                "Date",
                "PDF",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{inv.invoiceId}</td>
                <td className="px-4 py-2">{inv.studentName}</td>
                <td className="px-4 py-2">{inv.course.title}</td>
                <td className="px-4 py-2">
                  ₹{inv.course.discountedPrice.toFixed(2)}
                </td>
                <td className="px-4 py-2">₹{inv.taxAmount.toFixed(2)}</td>
                <td className="px-4 py-2 font-semibold text-indigo-600">
                  ₹{inv.totalAmount.toFixed(2)}
                </td>
                <td className="px-4 py-2">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  <a
                    href={`/api/invoices/${inv.invoiceId}/download`}
                    className="text-indigo-600 hover:underline"
                  >
                    PDF
                  </a>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
            title="Close Modal"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Create New Invoice</h2>

            <div className="space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    Admission Form ID
                  </label>
                  <input
                  title="Admission Form ID"
                    type="text"
                    value={admissionFormId}
                    onChange={(e) => setAdmissionFormId(e.target.value)}
                    className="mt-1 w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Student Name</label>
                  <input
                  title="Student Name"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="mt-1 w-full border px-3 py-2 rounded"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Father Name</label>
                  <input
                  title="Father Name"
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="mt-1 w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Student Address</label>
                  <input
                  title="Student Address"
                    type="text"
                    value={studentAddress}
                    onChange={(e) => setStudentAddress(e.target.value)}
                    className="mt-1 w-full border px-3 py-2 rounded"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">State (e.g. UP)</label>
                  <input
                  title="State Name"
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="mt-1 w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Select Course</label>
                  <select
                  title="Select Course"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="mt-1 w-full border px-3 py-2 rounded"
                  >
                    <option value="">-- Select a course --</option>
                    {courseOptions.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Original Price</label>
                  <input
                  title="Original Price"
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="mt-1 w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Discounted Price
                  </label>
                  <input
                  title="Discounted Price"
                    type="number"
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(Number(e.target.value))}
                    className="mt-1 w-full border px-3 py-2 rounded"
                  />
                </div>
              </div>

              {/* Row 5 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    Transaction ID
                  </label>
                  <input
                  title="Transaction ID"
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="mt-1 w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Payment Method
                  </label>
                  <select
                  title="Payment Method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 w-full border px-3 py-2 rounded"
                  >
                    <option>Online</option>
                    <option>UPI</option>
                    <option>Card</option>
                  </select>
                </div>
              </div>

              {/* Tax breakdown */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>CGST: ₹{cgst.toFixed(2)}</div>
                <div>SGST: ₹{sgst.toFixed(2)}</div>
                <div>IGST: ₹{igst.toFixed(2)}</div>
                <div>Total Tax: ₹{taxAmount.toFixed(2)}</div>
                <div className="col-span-2 font-semibold">
                  Grand Total: ₹{totalAmount.toFixed(2)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                >
                  Create Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
