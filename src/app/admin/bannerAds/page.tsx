"use client";
import { useState } from 'react';
import axios from 'axios';

export default function AdminBannerAdUpload() {
  const [bannerImg, setBannerImg] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!bannerImg) return alert('Please select an image!');

    const formData = new FormData();
    formData.append('bannerImg', bannerImg);

    try {
      const res = await axios.post('/api/bannerAds', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(res.data.message || 'Banner uploaded successfully!');
    } catch (error) {
      console.error('Error uploading banner ad:', error);
      alert('Failed to upload banner ad.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Upload Banner Ad</h1>
      <input
      title='file'
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
  );
}
