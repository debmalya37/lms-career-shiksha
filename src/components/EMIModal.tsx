"use client";
import React, { useState } from 'react';
import { X, CreditCard, Calendar, Banknote } from 'lucide-react';

interface EMIOption {
  months: 3 | 6;
  monthlyAmount: number;
  totalAmount: number;
}

interface EMIModalProps {
  isOpen: boolean;
  onClose: () => void;
  coursePrice: number;
  onSelectEMI: (months: 3 | 6, monthlyAmount: number) => void;
  courseName: string;
}

const EMIModal: React.FC<EMIModalProps> = ({
  isOpen,
  onClose,
  coursePrice,
  onSelectEMI,
  courseName
}) => {
  const [selectedOption, setSelectedOption] = useState<3 | 6 | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Calculate EMI options
  const emiOptions: EMIOption[] = [
    {
      months: 3,
      monthlyAmount: Math.ceil(coursePrice / 3),
      totalAmount: coursePrice
    },
    {
      months: 6,
      monthlyAmount: Math.ceil(coursePrice / 6),
      totalAmount: coursePrice
    }
  ];

  const handleConfirmEMI = async () => {
    if (!selectedOption) return;
    
    setIsProcessing(true);
    const option = emiOptions.find(opt => opt.months === selectedOption);
    if (option) {
      await onSelectEMI(selectedOption, option.monthlyAmount);
    }
    setIsProcessing(false);
  };

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
          <p className="text-2xl font-bold text-blue-600">₹{coursePrice.toFixed(2)}</p>
        </div>

        {/* EMI Options */}
        <div className="p-6 space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">Select Payment Plan:</h4>
          
          {emiOptions.map((option) => (
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
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    ₹{option.monthlyAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">per month</div>
                </div>
              </div>
              
              {/* Payment Schedule Preview */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">First Payment:</span>
                    <div className="font-semibold">₹{option.monthlyAmount.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Remaining:</span>
                    <div className="font-semibold">
                      {option.months - 1} × ₹{option.monthlyAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="px-6 pb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-semibold text-green-800 mb-2">EMI Benefits:</h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• No additional interest or processing fees</li>
              <li>• Instant course access after first payment</li>
              <li>• Automatic reminder for upcoming payments</li>
              <li>• Flexible payment dates</li>
            </ul>
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
              disabled={!selectedOption || isProcessing}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                selectedOption && !isProcessing
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