"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiPlus, FiX } from "react-icons/fi";
import { pdf } from "@react-pdf/renderer";
import { InvoiceDocument } from "@/components/InvoiceDocument";

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
  studentAddress?: string; // combined address
  address1: string;
  address2?: string;
  phone?: string;
  email?: string;
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

const STATES = [
  "UP","MH","DL","KA","TN","WB","GJ","RJ","MP","PB","HR","OR","KL","BR","JK",
  // add more as needed
];

export default function AdminInvoicesPage() {
  // Table & filter state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [gstTotal, setGstTotal] = useState(0);
  const [monthFilter, setMonthFilter] = useState("");
  const GST_PORTAL_URL = "https://www.gst.gov.in/";
  // Modal open
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [admissionFormId, setAdmissionFormId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [stateName, setStateName] = useState("");
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [transactionId, setTransactionId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Online");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Tax breakdown
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [igst, setIgst] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [cgstTotal, setCgstTotal] = useState<number>(0);
const [sgstTotal, setSgstTotal] = useState<number>(0);
const [igstTotal, setIgstTotal] = useState<number>(0);
const [revenueTotal, setRevenueTotal] = useState(0);
const [patTotal, setPatTotal] = useState(0);
const [invoiceCount, setInvoiceCount] = useState(0);
const [quarterFilter, setQuarterFilter] = useState("");
  // new month‐range filter state
  const [fromMonth, setFromMonth] = useState("");
  const [toMonth, setToMonth] = useState("");

  // Fetch invoices & GST total
 // Replace your existing fetchInvoices with this:

 const fetchInvoices = async () => {
  const res = await axios.get<{ invoices: Invoice[]; gstTotal: number }>("/api/invoices");
  let data = res.data.invoices;

  // if both fromMonth and toMonth selected, filter between
  if (fromMonth && toMonth) {
    const [fromY, fromM] = fromMonth.split("-").map(Number);
    const [toY, toM] = toMonth.split("-").map(Number);
    const start = new Date(fromY, fromM - 1, 1);
    const end = new Date(toY, toM, 1);
    data = data.filter(inv => {
      const d = new Date(inv.createdAt);
      return d >= start && d < end;
    });
  }

  setInvoices(data);
  setGstTotal(res.data.gstTotal);

  // recalc summaries
  const cg = data.reduce((s, i) => s + i.cgst, 0);
  const sg = data.reduce((s, i) => s + i.sgst, 0);
  const ig = data.reduce((s, i) => s + i.igst, 0);
  setCgstTotal(cg);
  setSgstTotal(sg);
  setIgstTotal(ig);

  const rev = data.reduce((s, i) => s + i.totalAmount, 0);
  const pat = data.reduce((s, i) => s + (i.totalAmount - i.taxAmount), 0);
  setRevenueTotal(rev);
  setPatTotal(pat);
  setInvoiceCount(data.length);
};

const filteredInvoices = invoices.filter(inv => {
    const term = searchTerm.toLowerCase();
    return (
      inv.invoiceId.toLowerCase().includes(term) ||
      inv.studentName.toLowerCase().includes(term) ||
      inv.course.title.toLowerCase().includes(term)
    );
  });

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
    if (stateName === "UP") {
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
        address1,
        address2,
        phone,
        email,
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
      setAddress1("");
      setAddress2("");
      setPhone("");
      setEmail("");
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

  // Download PDF
  const handleDownload = async (inv: Invoice) => {
    try {
      const blob = await pdf(<InvoiceDocument invoice={{ ...inv, studentAddress: `${inv.address1} ${inv.address2 || ""}` }} />).toBlob();
      // const blob = await pdf(<InvoiceDocument invoice={inv} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${inv.invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF generation error", e);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setBusyId(null);
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
          <div className="flex-1 min-w-[200px]">
        <label className="block text-sm">Search</label>
        <input
           type="text"
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
           placeholder="Invoice#, Student, Course…"
           className="mt-1 w-full border px-3 py-2 rounded"
         />
       </div>
          <div>
          <label className="block text-sm">From</label>
          <input
          title="Select From Month"
            type="month"
            value={fromMonth}
            onChange={e => setFromMonth(e.target.value)}
            className="mt-1 border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block text-sm">To</label>
          <input
          title="Select To Month"
            type="month"
            value={toMonth}
            onChange={e => setToMonth(e.target.value)}
            className="mt-1 border px-2 py-1 rounded"
          />
        </div>

        <button onClick={fetchInvoices} className="px-4 py-2 bg-gray-800 text-white rounded">
          Apply
        </button>
        <button
          onClick={() => { setFromMonth(""); setToMonth(""); }}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Clear
        </button>

          
          
          {/* <select
          title="Filter by Quarter"
            value={quarterFilter}
            onChange={e => {
              setQuarterFilter(e.target.value);
              setMonthFilter("");
            }}
            className="border px-3 py-2 rounded"
          >
            <option value="">Filter by Quarter</option>
            {["Q1","Q2","Q3","Q4"].map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
          <input
            type="month"
            value={monthFilter}
            onChange={e => {
              setMonthFilter(e.target.value);
              setQuarterFilter("");
            }}
            className="border px-3 py-2 rounded"
            title="Filter by Month"
          />
          <button
            onClick={fetchInvoices}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded"
          >
            Filter
          </button> */}
        </div>
        

        
      </div>

      {/* GST Total */}
      {/* GST Summary */}
      <div className="mb-6 p-4 bg-white rounded shadow space-y-2">
        <div>
          <span className="font-semibold">CGST Collected:</span>{" "}
          <span className="text-green-600 font-bold">₹{cgstTotal.toFixed(2)}</span>
        </div>
        <div>
          <span className="font-semibold">SGST Collected:</span>{" "}
          <span className="text-green-600 font-bold">₹{sgstTotal.toFixed(2)}</span>
        </div>
        <div>
          <span className="font-semibold">IGST Collected:</span>{" "}
          <span className="text-green-600 font-bold">₹{igstTotal.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2">
          <span className="font-semibold">Total GST Collected:</span>{" "}
          <span className="text-indigo-600 font-bold">₹{gstTotal.toFixed(2)}</span>
        </div>
        <button
          onClick={() => window.open(GST_PORTAL_URL, "_blank", "noopener")}
          className="mt-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded"
        >
          Pay GST on Portal
        </button>
      </div>


      {/* Revenue */}
        <div className="p-4 bg-white rounded shadow space-y-2">
          <div>
            <span className="font-semibold">Total Revenue:</span>{" "}
            <span className="text-indigo-600 font-bold">₹{revenueTotal.toFixed(2)}</span>
          </div>
          <div>
            <span className="font-semibold">Invoices:</span>{" "}
            <span className="font-bold">{invoiceCount}</span>
          </div>
          <div>
            <span className="font-semibold">Revenue After Tax:</span>{" "}
            <span className="text-indigo-600 font-bold">₹{patTotal.toFixed(2)}</span>
          </div>
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
          {filteredInvoices.map(inv => (
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
                  <button
                    onClick={() => handleDownload(inv)}
                    disabled={busyId === inv._id}
                    className={`inline-block px-2 py-1 rounded text-sm ${
                      busyId === inv._id
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {busyId === inv._id ? "Generating…" : "Download"}
                  </button>
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
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
                  <label className="block text-sm font-medium">
                    Student Name
                  </label>
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
                  <label className="block text-sm font-medium">
                    Father’s Name
                  </label>
                  <input
                    title="Father’s Name"
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="mt-1 w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    title="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full border px-3 py-2 rounded"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Phone</label>
                  <input
                    title="Phone Number"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">State</label>
                  <select
                    title="Select State"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="mt-1 w-full border px-3 py-2 rounded"
                  >
                    <option value="">-- Select State --</option>
                    {STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Address lines */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Address Line 1</label>
                  <input
                    title="Address Line 1"
                    type="text"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    className="mt-1 w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Address Line 2</label>
                  <input
                    title="Address Line 2"
                    type="text"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    className="mt-1 w-full border px-3 py-2 rounded"
                  />
                </div>
              </div>

              {/* Row 5 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              {/* Row 6 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
