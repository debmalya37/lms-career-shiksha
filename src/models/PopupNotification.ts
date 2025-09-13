// models/PopupNotification.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IPopupNotification extends Document {
  title: string;
  imageUrl?: string;
  date: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PopupNotificationSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    date: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
PopupNotificationSchema.index({ isActive: 1, date: -1 });

export default mongoose.models.PopupNotification || 
  mongoose.model<IPopupNotification>('PopupNotification', PopupNotificationSchema);