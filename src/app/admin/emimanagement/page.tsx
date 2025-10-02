"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  CreditCard,
  Plus,
  Save,
  ToggleLeft,
  ToggleRight,
  BookOpen,
  IndianRupee,
  Calendar,
  Percent,
  Search,
  Filter,
  Edit3,
  Trash2,
  AlertTriangle,
  Info
} from "lucide-react";

interface EMIOption {
  months: number;
  // New: per-month custom prices
  monthlyAmounts?: number[]; // length === months
  // Backwards-compatible single-month value (may exist on older docs)
  monthlyAmount?: number;
  processingFee: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  discountedPrice: number;
  isFree: boolean;
  emiEnabled: boolean;
  emiPrice: number;
  emiOptions: EMIOption[];
  emiProcessingFeePercentage: number;
  emiMinimumAmount: number;
  courseImg?: string;
}

export default function EMIManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEMI, setFilterEMI] = useState<"all" | "enabled" | "disabled">("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, []);

  // Filter courses based on search and EMI status
  useEffect(() => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterEMI !== "all") {
      filtered = filtered.filter((course) =>
        filterEMI === "enabled" ? course.emiEnabled : !course.emiEnabled
      );
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, filterEMI]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/admin/courses/emi");
      const result = await response.json();

      if (result.success) {
        setCourses(result.data);
      } else {
        alert("Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      alert("Error loading courses");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEMI = async (courseId: string, currentStatus: boolean) => {
    setSaving(courseId);
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/emi`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emiEnabled: !currentStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCourses((prev) =>
          prev.map((course) =>
            course._id === courseId ? { ...course, emiEnabled: !currentStatus } : course
          )
        );
      } else {
        alert("Failed to update EMI status");
      }
    } catch (error) {
      console.error("Error updating EMI status:", error);
      alert("Error updating EMI status");
    } finally {
      setSaving(null);
    }
  };

  // const handleUpdateCourse = async (updatedCourse: Course | null) => {
  //   if (!updatedCourse) return;
  //   setSaving(updatedCourse._id);
  //   try {
  //     // send emiOptions as-is (including monthlyAmounts). Backend should accept monthlyAmounts.
  //     const response = await fetch(`/api/admin/courses/${updatedCourse._id}/emi`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         emiPrice: updatedCourse.emiPrice,
  //         emiOptions: updatedCourse.emiOptions,
  //         emiProcessingFeePercentage: updatedCourse.emiProcessingFeePercentage,
  //         emiMinimumAmount: updatedCourse.emiMinimumAmount,
  //       }),
  //     });

  //     const result = await response.json();

  //     if (result.success) {
  //       setCourses((prev) => prev.map((course) => (course._id === updatedCourse._id ? updatedCourse : course)));
  //       setShowEditModal(false);
  //       setSelectedCourse(null);
  //       alert("Course EMI settings updated successfully!");
  //     } else {
  //       alert("Failed to update course EMI settings");
  //     }
  //   } catch (error) {
  //     console.error("Error updating course:", error);
  //     alert("Error updating course EMI settings");
  //   } finally {
  //     setSaving(null);
  //   }
  // };

  // Add this function to clean and validate data before sending to API
const cleanEMIOptionsForAPI = (emiOptions: EMIOption[], course: Course): EMIOption[] => {
  return emiOptions.map(option => {
    const cleanedOption: EMIOption = {
      months: Math.max(1, Math.min(24, Number(option.months) || 1)),
      processingFee: Math.max(0, Number(option.processingFee) || 0),
    };

    // Ensure monthlyAmounts is properly formatted
    if (Array.isArray(option.monthlyAmounts) && option.monthlyAmounts.length === option.months) {
      cleanedOption.monthlyAmounts = option.monthlyAmounts.map(amount => 
        Math.max(0, Number(amount) || 0)
      );
    } else if (option.monthlyAmount !== undefined) {
      // Fallback to old format
      cleanedOption.monthlyAmount = Math.max(0, Number(option.monthlyAmount) || 0);
    } else {
      // Create default amounts if nothing is available
      const defaultAmount = Math.ceil((course.emiPrice || course.discountedPrice || 1000) / cleanedOption.months);
      cleanedOption.monthlyAmounts = Array.from({ length: cleanedOption.months }, () => defaultAmount);
    }

    return cleanedOption;
  });
};

// Update your handleUpdateCourse function
const handleUpdateCourse = async (updatedCourse: Course | null) => {
  if (!updatedCourse) return;
  setSaving(updatedCourse._id);
  
  try {
    // Clean and validate the EMI options before sending
    const cleanedOptions = cleanEMIOptionsForAPI(updatedCourse.emiOptions || [], updatedCourse);
    
    const payload = {
      emiPrice: Number(updatedCourse.emiPrice) || 0,
      emiOptions: cleanedOptions,
      emiProcessingFeePercentage: Number(updatedCourse.emiProcessingFeePercentage) || 0,
      emiMinimumAmount: Number(updatedCourse.emiMinimumAmount) || 1000,
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2)); // Debug log

    const response = await fetch(`/api/admin/courses/${updatedCourse._id}/emi`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      setCourses((prev) => prev.map((course) => (course._id === updatedCourse._id ? updatedCourse : course)));
      setShowEditModal(false);
      setSelectedCourse(null);
      alert("Course EMI settings updated successfully!");
    } else {
      console.error('API Error:', result);
      alert(`Failed to update course EMI settings: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error("Error updating course:", error);
    alert("Error updating course EMI settings");
  } finally {
    setSaving(null);
  }
};

  const openEditModal = (course: Course) => {
    // Normalize each emiOption so monthlyAmounts exists (backwards compatible)
    const normalizedOptions = (course.emiOptions || []).map((opt) => {
      if (Array.isArray(opt.monthlyAmounts) && opt.monthlyAmounts.length === opt.months) {
        return { ...opt };
      }

      // If monthlyAmounts missing but monthlyAmount present — fill
      if (opt.monthlyAmount !== undefined && opt.monthlyAmount !== null) {
        return { ...opt, monthlyAmounts: Array.from({ length: opt.months }, () => Number(opt.monthlyAmount || 0)) };
      }

      // fallback: split emiPrice (or discountedPrice) evenly
      const base = Math.ceil((course.emiPrice || course.discountedPrice) / Math.max(1, opt.months));
      return { ...opt, monthlyAmounts: Array.from({ length: opt.months }, () => base) };
    });

    const normalizedCourse: Course = {
      ...course,
      emiOptions: normalizedOptions,
    };

    setSelectedCourse(normalizedCourse);
    setShowEditModal(true);
  };

  const calculateEMIPrice = (basePrice: number, processingFeePercentage: number) => {
    return basePrice + (basePrice * processingFeePercentage) / 100;
  };

  const addEMIOption = (course: Course | null) => {
    if (!course) return;
    const months = 3;
    const defaultPerMonth = Math.ceil((course.emiPrice || course.discountedPrice) / months);
    const newOption: EMIOption = {
      months,
      monthlyAmounts: Array.from({ length: months }, () => defaultPerMonth),
      processingFee: 0,
    };

    const updatedCourse = {
      ...course,
      emiOptions: [...(course.emiOptions || []), newOption],
    };
    setSelectedCourse(updatedCourse);
  };

  const removeEMIOption = (course: Course | null, index: number) => {
    if (!course) return;
    const updatedCourse = {
      ...course,
      emiOptions: (course.emiOptions || []).filter((_, i) => i !== index),
    };
    setSelectedCourse(updatedCourse);
  };

  // Update months or processingFee for an option (months change resizes monthlyAmounts)
  const updateEMIOption = (course: Course | null, index: number, field: "months" | "processingFee", value: number) => {
    if (!course) return;
    const opts = (course.emiOptions || []).map((o) => ({ ...o }));
    const opt = opts[index];
    if (!opt) return;

    if (field === "months") {
      const newMonths = Math.max(1, Math.min(24, Math.floor(value || 1)));
      const currentAmounts = Array.isArray(opt.monthlyAmounts) ? [...opt.monthlyAmounts] : [];

      if (currentAmounts.length > newMonths) {
        currentAmounts.length = newMonths; // truncate
      } else if (currentAmounts.length < newMonths) {
        // extend: fill with last value or equal split
        const lastVal = currentAmounts.length ? currentAmounts[currentAmounts.length - 1] : Math.ceil((course.emiPrice || course.discountedPrice) / newMonths);
        while (currentAmounts.length < newMonths) currentAmounts.push(lastVal);
      }

      opt.months = newMonths;
      opt.monthlyAmounts = currentAmounts;
    } else if (field === "processingFee") {
      opt.processingFee = Math.max(0, value || 0);
    }

    opts[index] = opt;
    setSelectedCourse({ ...course, emiOptions: opts });
  };

  // Set same monthly amount for all months of an option
  // const setSameMonthlyAmount = (course: Course | null, optionIndex: number, amount: number) => {
  //   if (!course) return;
  //   const opts = (course.emiOptions || []).map((o) => ({ ...o }));
  //   const opt = opts[optionIndex];
  //   if (!opt) return;
  //   const newAmounts = Array.from({ length: opt.months }, () => Math.max(0, Math.floor(amount || 0)));
  //   opt.monthlyAmounts = newAmounts;
  //   // Also keep monthlyAmount for backward-compat if desired
  //   opt.monthlyAmount = Math.max(0, Math.floor(amount || 0));
  //   opts[optionIndex] = opt;
  //   setSelectedCourse({ ...course, emiOptions: opts });
  // };

  // // Edit a single month's price
  // const updateMonthlyAmount = (course: Course | null, optionIndex: number, monthIndex: number, value: number) => {
  //   if (!course) return;
  //   const opts = (course.emiOptions || []).map((o) => ({ ...o }));
  //   const opt = opts[optionIndex];
  //   if (!opt) return;
  //   const arr = Array.isArray(opt.monthlyAmounts) ? [...opt.monthlyAmounts] : Array.from({ length: opt.months }, () => opt.monthlyAmount || 0);
  //   arr[monthIndex] = Math.max(0, Math.floor(value || 0));
  //   opt.monthlyAmounts = arr;
  //   opts[optionIndex] = opt;
  //   setSelectedCourse({ ...course, emiOptions: opts });
  // };

// Update the setSameMonthlyAmount function to handle empty values better
const setSameMonthlyAmount = (course: Course | null, optionIndex: number, amount: number | string) => {
  if (!course) return;
  const opts = (course.emiOptions || []).map((o) => ({ ...o }));
  const opt = opts[optionIndex];
  if (!opt) return;
  
  // Handle empty string or invalid input
  const cleanAmount = amount === "" ? 0 : Math.max(0, Math.floor(Number(amount) || 0));
  const newAmounts = Array.from({ length: opt.months }, () => cleanAmount);
  
  opt.monthlyAmounts = newAmounts;
  // Also keep monthlyAmount for backward-compat if desired
  opt.monthlyAmount = cleanAmount;
  opts[optionIndex] = opt;
  setSelectedCourse({ ...course, emiOptions: opts });
};

// Update the updateMonthlyAmount function similarly
const updateMonthlyAmount = (course: Course | null, optionIndex: number, monthIndex: number, value: number | string) => {
  if (!course) return;
  const opts = (course.emiOptions || []).map((o) => ({ ...o }));
  const opt = opts[optionIndex];
  if (!opt) return;
  
  const arr = Array.isArray(opt.monthlyAmounts) ? [...opt.monthlyAmounts] : Array.from({ length: opt.months }, () => opt.monthlyAmount || 0);
  
  // Handle empty string or invalid input
  const cleanValue = value === "" ? 0 : Math.max(0, Math.floor(Number(value) || 0));
  arr[monthIndex] = cleanValue;
  
  opt.monthlyAmounts = arr;
  opts[optionIndex] = opt;
  setSelectedCourse({ ...course, emiOptions: opts });
};

  const computeOptionTotal = (opt: EMIOption | undefined) => {
    if (!opt) return 0;
    if (Array.isArray(opt.monthlyAmounts) && opt.monthlyAmounts.length) {
      const sum = opt.monthlyAmounts.reduce((s, v) => s + (Number(v) || 0), 0);
      return sum + (opt.processingFee || 0);
    }
    if (opt.monthlyAmount) {
      return Number(opt.monthlyAmount) * (opt.months || 1) + (opt.processingFee || 0);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">EMI Management</h1>
                  <p className="mt-1 text-sm text-gray-500">Configure EMI options and pricing for courses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search courses by title or description..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  title="Filter by EMI status"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filterEMI}
                  onChange={(e) => setFilterEMI(e.target.value as "all" | "enabled" | "disabled")}
                >
                  <option value="all">All Courses</option>
                  <option value="enabled">EMI Enabled</option>
                  <option value="disabled">EMI Disabled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-6">
          {filteredCourses.map((course) => (
            <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      {course.courseImg ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={course.courseImg} alt={course.title} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <BookOpen className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 max-w-md">{course.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-600">Base Price: ₹{course.discountedPrice.toFixed(2)}</span>
                        {course.emiEnabled && <span className="text-sm text-green-600">EMI Price: ₹{course.emiPrice.toFixed(2)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* EMI Status Toggle */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">EMI</span>
                      <button
                        onClick={() => handleToggleEMI(course._id, course.emiEnabled)}
                        disabled={saving === course._id || course.isFree}
                        className={`p-1 rounded-lg transition-colors ${course.emiEnabled ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"} ${
                          course.isFree ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {course.emiEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                      </button>
                    </div>

                    {/* Edit Button */}
                    <button
                      onClick={() => openEditModal(course)}
                      disabled={course.isFree}
                      className={`inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        course.isFree ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Configure EMI
                    </button>
                  </div>
                </div>

                {/* EMI Options Preview */}
                {course.emiEnabled && course.emiOptions.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Available EMI Options:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {course.emiOptions.map((option, index) => {
                        const total = Array.isArray(option.monthlyAmounts) && option.monthlyAmounts.length
                          ? option.monthlyAmounts.reduce((s, v) => s + (Number(v) || 0), 0) + (option.processingFee || 0)
                          : (option.monthlyAmount ? option.monthlyAmount * option.months + (option.processingFee || 0) : 0);

                        return (
                          <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">{option.months} Months</span>
                              <span className="text-xs text-gray-500">Total: ₹{total.toFixed(2)}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {Array.isArray(option.monthlyAmounts) && option.monthlyAmounts.length
                                ? `${option.monthlyAmounts.length} custom monthly prices`
                                : option.monthlyAmount
                                ? `₹${option.monthlyAmount}/mo`
                                : "No pricing"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Warning for free courses */}
                {course.isFree && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-700">EMI options are not available for free courses</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No courses found</h3>
            <p className="mt-1 text-sm text-gray-500">{searchTerm || filterEMI !== "all" ? "Try adjusting your search or filter criteria." : "No courses available."}</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Configure EMI Settings</h2>
                  <p className="text-sm text-gray-500">{selectedCourse.title}</p>
                </div>
              </div>
              <button onClick={() => { setShowEditModal(false); setSelectedCourse(null); }} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">×</button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic EMI Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Course Price</label>
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="w-4 h-4 text-gray-500" />
                    <span className="text-lg font-semibold text-gray-900">{selectedCourse.discountedPrice.toFixed(2)}</span>
                    <span className="text-sm text-gray-500">(Read Only)</span>
                  </div>
                </div>

                <div>
                  {/* <label className="block text-sm font-medium text-gray-700 mb-2">EMI Processing Fee (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      title="EMI Processing Fee Percentage"
                      type="number"
                      min="0"
                      max="50"
                      step="0.5"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedCourse.emiProcessingFeePercentage}
                      onChange={(e) => {
                        const percentage = parseFloat(e.target.value) || 0;
                        const newEmiPrice = calculateEMIPrice(selectedCourse.discountedPrice, percentage);
                        setSelectedCourse({
                          ...selectedCourse,
                          emiProcessingFeePercentage: percentage,
                          emiPrice: newEmiPrice,
                        });
                      }}
                    />
                  </div> */}
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total EMI Price</label>
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="w-4 h-4 text-gray-500" />
                    <span className="text-lg font-semibold text-green-600">{selectedCourse.emiPrice.toFixed(2)}</span>
                    <div className="text-xs text-gray-500">(+₹{(selectedCourse.emiPrice - selectedCourse.discountedPrice).toFixed(2)} extra)</div>
                  </div>
                </div> */}

                <div>
                  {/* <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Amount for EMI</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      title="Minimum Course Price to Enable EMI"
                      type="number"
                      min="500"
                      step="100"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedCourse.emiMinimumAmount}
                      onChange={(e) => setSelectedCourse({ ...selectedCourse, emiMinimumAmount: parseInt(e.target.value) || 1000 })}
                    />
                  </div> */}
                </div>
              </div>

              {/* EMI Options */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">EMI Payment Options</h3>
                  <button onClick={() => addEMIOption(selectedCourse)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedCourse.emiOptions.map((option, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Months</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              title="Number of Months"
                              type="number"
                              min="1"
                              max="24"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={option.months}
                              onChange={(e) => updateEMIOption(selectedCourse, index, "months", parseInt(e.target.value) || 1)}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Set Same Monthly Amount (applies to all months)</label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              title="Set same monthly amount for all months"
                              type="number"
                              min="0"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={option.monthlyAmounts && option.monthlyAmounts.length ? option.monthlyAmounts[0] ?? 0 : option.monthlyAmount ?? 0}
                              onChange={(e) => setSameMonthlyAmount(selectedCourse, index, parseInt(e.target.value || "0"))}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Processing Fee</label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              title="Processing Fee in INR"
                              type="number"
                              min="0"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={option.processingFee}
                              onChange={(e) => updateEMIOption(selectedCourse, index, "processingFee", parseInt(e.target.value || "0"))}
                            />
                          </div>
                        </div>

                        <div className="flex items-end">
                          <button
                            title="Remove Option"
                            onClick={() => removeEMIOption(selectedCourse, index)}
                            className="w-full py-2 px-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </div>

                      {/* Per-month inputs */}
                      <div className="mt-4">
                        <div className="text-sm text-gray-700 mb-2">Per-month prices</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                          {Array.from({ length: option.months }).map((_, mi) => {
                            const val = Array.isArray(option.monthlyAmounts) && option.monthlyAmounts[mi] !== undefined
                              ? option.monthlyAmounts[mi]
                              : option.monthlyAmount ?? Math.ceil(selectedCourse.emiPrice / Math.max(1, option.months));
                            return (
                              <div key={mi}>
                                <label className="text-xs text-gray-600">M{mi + 1}</label>
                                <div className="relative">
                                  <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                                  <input
                                  title="Monthly Amount"
                                    type="number"
                                    min="0"
                                    className="w-full pl-8 p-2 border rounded"
                                    value={val}
                                    onChange={(e) => updateMonthlyAmount(selectedCourse, index, mi, parseInt(e.target.value || "0"))}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">Total Amount:</span>
                          <span className="font-semibold text-gray-900">₹{computeOptionTotal(option).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">EMI Configuration Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Set processing fee percentage to cover transaction costs</li>
                      <li>Offer multiple month options for flexibility</li>
                      <li>Monthly amounts are customizable per month</li>
                      <li>Processing fees are added to the total EMI amount</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button onClick={() => { setShowEditModal(false); setSelectedCourse(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors">Cancel</button>
              <button
                onClick={() => handleUpdateCourse(selectedCourse)}
                disabled={saving === selectedCourse._id}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving === selectedCourse._id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
