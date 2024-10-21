import React from 'react';

const tutorials = [
  { id: 1, title: 'Video 1', url: 'https://www.youtube.com/embed/vNjX0YDFTLg?si=ZDnTdr9oVEZkwY3L' },
  { id: 2, title: 'Video 2', url: 'https://www.youtube.com/embed/LvunL6Iy_hc?si=28zfUOtOmahU-SyD' },
];

export default function TutorialsPage() {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Tutorials</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-xl font-semibold mb-4">{video.title}</h3>
              <iframe
              title='tutorials'
                className="w-full h-48"
                src={video.url}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
