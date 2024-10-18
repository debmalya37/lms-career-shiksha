import React from 'react';

const tutorials = [
  { id: 1, title: 'Video 1', url: 'https://www.youtube.com/embed/vNjX0YDFTLg?si=ZDnTdr9oVEZkwY3L' },
  { id: 2, title: 'Video 2', url: 'https://www.youtube.com/embed/LvunL6Iy_hc?si=28zfUOtOmahU-SyD' },
];

export default function TutorialsPage() {
  return (
    <div>
      <h1>Tutorials</h1>
      {tutorials.map((video) => (
        <div key={video.id}>
          <h3>{video.title}</h3>
          <iframe
          title='tutorials'
            width="560"
            height="315"
            src={video.url}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        />
        </div>
      ))}
    </div>
  );
}
