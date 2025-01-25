import mongoose, { Schema, model, models } from 'mongoose';

const bannerAdSchema = new Schema({
  imageUrl: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const BannerAd = models.BannerAd || model('BannerAd', bannerAdSchema);

export default BannerAd;
