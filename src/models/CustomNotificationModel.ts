// models/notificationModel.ts
import mongoose, { Schema, Document } from 'mongoose';

interface NotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'quiz_reviewed' | 'general' | 'assignment' | 'announcement';
  relatedId?: mongoose.Types.ObjectId; // Related quiz submission ID
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['quiz_reviewed', 'general', 'assignment', 'announcement'],
    default: 'general'
  },
  relatedId: { type: Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.Notification || mongoose.model<NotificationDocument>('Notification', NotificationSchema);