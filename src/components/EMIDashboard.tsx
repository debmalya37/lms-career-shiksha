"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, CreditCard, Clock, AlertCircle, CheckCircle2, IndianRupee } from 'lucide-react';

interface PendingEMI {
  _id: string;
  courseName: string;
  monthsLeft: number;
  emiAmount: number;
  nextDueDate: string;
  totalEMIMonths: number;
  originalTransactionId: string;
}

const EMIDashboard: React.FC = () => {
  const [pendingEMIs, setPendingEMIs] = useState<PendingEMI[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingEMIs();
  }, []);

  const fetchPendingEMIs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/emi/pay');
      const data = await response.json();
      
      if (response.ok) {
        setPendingEMIs(data.pendingEMIs);
      } else {
        setError(data.error || 'Failed to fetch EMI payments');
      }
    } catch (err) {
      setError('Failed to fetch EMI payments');
    } finally {
      setLoading(false);
    }
  };

  const handlePayEMI = async (courseId: string, transactionId: string) => {
    try {
      setPaymentLoading(courseId);
      const response = await fetch('/api/emi/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          transactionId
        })
      });

      const data = await response.json();

      if (response.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setError(data.error || 'Failed to initiate EMI payment');
        setPaymentLoading(null);
      }
    } catch (err) {
      setError('Failed to initiate EMI payment');
      setPaymentLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDateString: string) => {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return 'text-red-600 bg-red-50 border-red-200';
    if (daysUntilDue <= 7) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusText = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return `Overdue by ${Math.abs(daysUntilDue)} day(s)`;
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue <= 7) return `Due in ${daysUntilDue} day(s)`;
    return `Due in ${daysUntilDue} day(s)`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 font-medium">Error</span>
        </div>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  if (pendingEMIs.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">All EMI Payments Complete!</h3>
        <p className="text-gray-600">You have no pending EMI payments at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">EMI Payment Dashboard</h2>
        <p className="text-gray-600">Manage your course EMI payments and view upcoming due dates.</p>
      </div>

      <div className="grid gap-6">
        {pendingEMIs.map((emi) => {
          const daysUntilDue = getDaysUntilDue(emi.nextDueDate);
          const statusColor = getStatusColor(daysUntilDue);
          const statusText = getStatusText(daysUntilDue);
          const completedInstallments = emi.totalEMIMonths - emi.monthsLeft;
          const progressPercentage = (completedInstallments / emi.totalEMIMonths) * 100;

          return (
            <div key={`${emi._id}-${emi.originalTransactionId}`} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{emi.courseName}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Transaction ID: {emi.originalTransactionId}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-sm font-medium ${statusColor}`}>
                    {statusText}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Payment Progress
                    </span>
                    <span className="text-sm text-gray-500">
                      {completedInstallments} of {emi.totalEMIMonths} payments completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* EMI Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <IndianRupee className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Payment</p>
                      <p className="text-lg font-semibold text-gray-900">₹{emi.emiAmount.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payments Left</p>
                      <p className="text-lg font-semibold text-gray-900">{emi.monthsLeft}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(emi.nextDueDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={() => handlePayEMI(emi._id, emi.originalTransactionId)}
                  disabled={paymentLoading === emi._id}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    daysUntilDue <= 7
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                  } ${paymentLoading === emi._id ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                >
                  {paymentLoading === emi._id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Pay ₹{emi.emiAmount.toFixed(2)} Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EMIDashboard;