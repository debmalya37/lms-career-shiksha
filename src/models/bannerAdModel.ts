// models/bannerAdModel.ts
import mongoose, { Schema, model, models } from 'mongoose';

const bannerAdSchema = new Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true, // Make it required or optional as needed
  },
}, { timestamps: true });

const BannerAd = models.BannerAd || model('BannerAd', bannerAdSchema);

export default BannerAd;
