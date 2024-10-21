import React from 'react';

export default function LiveClassesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Live Classes</h1>
      <div className="bg-white rounded-lg shadow-md p-4">
        <iframe
        title='live-classes'
          className="w-full h-64"
          src="hhttps://www.youtube.com/embed/p_hshqtEmdc?si=GUqYu8YtJUYayGSM"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}




