"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

interface BannerAd {
  _id: string;
  imageUrl: string;
}

export default function AdminBannerAdUpload() {
  const [bannerImg, setBannerImg] = useState<File | null>(null);
  const [bannerAds, setBannerAds] = useState<BannerAd[]>([]);

  // Fetch banner ads
  const fetchBannerAds = async () => {
    try {
      const res = await axios.get('/api/bannerAds');
      setBannerAds(res.data);
    } catch (error) {
      console.error('Error fetching banner ads:', error);
      alert('Failed to fetch banner ads.');
    }
  };

  useEffect(() => {
    fetchBannerAds();
  }, []);

  // Upload a new banner ad
  const handleUpload = async () => {
    if (!bannerImg) return alert('Please select an image!');

    const formData = new FormData();
    formData.append('bannerImg', bannerImg);

    try {
      const res = await axios.post('/api/bannerAds', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(res.data.message || 'Banner uploaded successfully!');
      setBannerImg(null);
      fetchBannerAds(); // Refresh the list
    } catch (error) {
      console.error('Error uploading banner ad:', error);
      alert('Failed to upload banner ad.');
    }
  };

  // Delete a banner ad
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner ad?')) return;

    try {
      await axios.delete(`/api/bannerAds?id=${id}`);
      alert('Banner ad deleted successfully!');
      fetchBannerAds(); // Refresh the list
    } catch (error) {
      console.error('Error deleting banner ad:', error);
      alert('Failed to delete banner ad.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Manage Banner Ads</h1>

      {/* Upload Section */}
      <div className="mb-6">
        <input
        title='upload file'
          type="file"
          accept="image/*"
          onChange={(e) => setBannerImg(e.target.files?.[0] || null)}
          className="mb-4"
        />
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Upload
        </button>
      </div>

      {/* List of Banner Ads */}
      <h2 className="text-lg font-bold mb-4">Uploaded Banner Ads</h2>
      <ul className="space-y-4">
        {bannerAds.map((ad) => (
          <li
            key={ad._id}
            className="flex items-center justify-between bg-gray-100 p-4 rounded shadow"
          >
            <img src={ad.imageUrl} alt="Banner" className="h-16 w-32 object-cover rounded" />
            <button
              onClick={() => handleDelete(ad._id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
