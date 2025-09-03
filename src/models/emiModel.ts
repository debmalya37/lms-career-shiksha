// models/emiModel.ts
import mongoose, { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';

export interface IEMI extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  originalTransactionId: string;
  totalAmount: number;
  emiAmount: number;
  totalEMIMonths: number;
  monthsLeft: number;
  nextEMIDueDate: Date;
  emiStartDate: Date;
  processingFee: number;
  status: 'active' | 'completed' | 'overdue' | 'cancelled';
  payments: {
    paymentDate: Date;
    amount: number;
    transactionId: string;
    status: 'success' | 'failed' | 'pending';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const EMISchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  courseId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  originalTransactionId: { 
    type: String, 
    required: true 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  emiAmount: { 
    type: Number, 
    required: true 
  },
  totalEMIMonths: { 
    type: Number, 
    required: true 
  },
  monthsLeft: { 
    type: Number, 
    required: true 
  },
  nextEMIDueDate: { 
    type: Date, 
    required: true 
  },
  emiStartDate: { 
    type: Date, 
    default: Date.now 
  },
  processingFee: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'overdue', 'cancelled'], 
    default: 'active' 
  },
  payments: [{
    paymentDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['success', 'failed', 'pending'], 
      default: 'pending' 
    }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
EMISchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
EMISchema.index({ userId: 1, courseId: 1 });
EMISchema.index({ nextEMIDueDate: 1, status: 1 });
EMISchema.index({ originalTransactionId: 1 });

const EMI = mongoose.models.EMI || mongoose.model<IEMI>('EMI', EMISchema);
export default EMI;