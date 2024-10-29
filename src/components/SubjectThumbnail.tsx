// SubjectThumbnail.tsx
import React from 'react';

interface SubjectThumbnailProps {
  subject: string;
  imageUrl: string; // URL for the thumbnail image
}

const SubjectThumbnail: React.FC<SubjectThumbnailProps> = ({ subject, imageUrl }) => {
  return (
    <div className="relative w-full h-48 mb-6">
      <img
        src={imageUrl}
        alt={subject}
        className="object-cover w-full h-full rounded-md"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <h3 className="text-white text-2xl font-bold">{subject}</h3>
      </div>
    </div>
  );
};

export default SubjectThumbnail;
