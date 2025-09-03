"use client";
import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, Banknote, AlertCircle, Info } from 'lucide-react';

interface EMIOption {
  months: number;
  monthlyAmount: number;
  processingFee: number;
}

interface Course {
  _id: string;
  title: string;
  emiEnabled: boolean;
  emiPrice: number;
  emiOptions: EMIOption[];
  emiProcessingFeePercentage: number;
  emiMinimumAmount: number;
  discountedPrice: number;
}

interface EMIModalProps {
  isOpen: boolean;
  onClose: () => void;
  coursePrice: number;
  onSelectEMI: (months: number, monthlyAmount: number) => void;
  courseName: string;
  courseId: string;
}

const EMIModal: React.FC<EMIModalProps> = ({
  isOpen,
  onClose,
  coursePrice,
  onSelectEMI,
  courseName,
  courseId
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseEMIData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}/emi-options`);
      const result = await response.json();
      
      if (result.success) {
        setCourseData(result.data);
        
        // Check if EMI is available for this course
        if (!result.data.emiEnabled) {
          setError('EMI is not available for this course');
        } else if (coursePrice < result.data.emiMinimumAmount) {
          setError(`EMI is only available for purchases above ₹${result.data.emiMinimumAmount}`);
        }
      } else {
        setError('Failed to load EMI options');
      }
    } catch (err) {
      setError('Error loading EMI options');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isOpen && courseId) {
      fetchCourseEMIData();
    }
  }, [isOpen, courseId]);

  

  const handleConfirmEMI = async () => {
    if (!selectedOption || !courseData) return;
    
    setIsProcessing(true);
    const option = courseData.emiOptions.find(opt => opt.months === selectedOption);
    if (option) {
      await onSelectEMI(selectedOption, option.monthlyAmount);
    }
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading EMI options...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">EMI Not Available</h2>
              <button
              title='Close Modal'
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-medium">Error</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">EMI Options</h2>
              <p className="text-sm text-gray-500">Choose your payment plan</p>
            </div>
          </div>
          <button
            title='Close Modal'
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Course Info */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <h3 className="font-semibold text-gray-900 mb-1">{courseName}</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Regular Price: ₹{courseData.discountedPrice.toFixed(2)}</p>
            {/* <p className="text-2xl font-bold text-orange-600">EMI Price: ₹{courseData.emiPrice.toFixed(2)}</p> */}
          </div>
          {courseData.emiPrice > courseData.discountedPrice && (
            <p className="text-xs text-orange-500 mt-1">
              Additional ₹{(courseData.emiPrice - courseData.discountedPrice).toFixed(2)} for EMI convenience
            </p>
          )}
        </div>

        {/* EMI Options */}
        <div className="p-6 space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">Select Payment Plan:</h4>
          
          {courseData.emiOptions.map((option) => {
            const totalWithFee = (option.monthlyAmount * option.months) + option.processingFee;
            const firstPayment = option.monthlyAmount + option.processingFee;
            
            return (
              <div
                key={option.months}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                  selectedOption === option.months
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedOption(option.months)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedOption === option.months
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedOption === option.months && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          {option.months} Months EMI
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Banknote className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">
                          Pay ₹{option.monthlyAmount.toFixed(2)} per month
                        </span>
                      </div>
                      {option.processingFee > 0 && (
                        <div className="text-xs text-orange-600 mt-1">
                          + ₹{option.processingFee} processing fee (first payment only)
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ₹{option.monthlyAmount.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">per month</div>
                    {option.processingFee > 0 && (
                      <div className="text-xs text-orange-500">
                        First: ₹{firstPayment.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Payment Schedule Preview */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">First Payment:</span>
                      <div className="font-semibold">₹{firstPayment.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Remaining:</span>
                      <div className="font-semibold">
                        {option.months - 1} × ₹{option.monthlyAmount.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Total:</span>
                      <div className="font-semibold text-orange-600">
                        ₹{totalWithFee.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  {totalWithFee > courseData.discountedPrice && (
                    <div className="mt-2 text-xs text-orange-600">
                      Extra cost: ₹{(totalWithFee - courseData.discountedPrice).toFixed(2)} 
                      ({(((totalWithFee - courseData.discountedPrice) / courseData.discountedPrice) * 100).toFixed(1)}% more than regular price)
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {courseData.emiOptions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No EMI options available for this course.</p>
              <p className="text-sm">Please contact support for assistance.</p>
            </div>
          )}
        </div>

        {/* Benefits Section */}
        <div className="px-6 pb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-semibold text-blue-800 mb-2">EMI Benefits & Terms:</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Instant course access after first payment</li>
                  <li>• Automatic payment reminders via SMS/email</li>
                  <li>• Secure payment processing</li>
                  <li>• Course access remains active during EMI period</li>
                  {courseData.emiProcessingFeePercentage > 0 && (
                    <li>• Processing fee: {courseData.emiProcessingFeePercentage}% of course price</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmEMI}
              disabled={!selectedOption || isProcessing || courseData.emiOptions.length === 0}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                selectedOption && !isProcessing && courseData.emiOptions.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Continue with EMI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EMIModal;