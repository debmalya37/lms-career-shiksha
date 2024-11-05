// SubjectThumbnail.tsx
import React from 'react';
import Image from 'next/image';
interface SubjectThumbnailProps {
  subject: string;
  imageUrl: string; // URL for the thumbnail image
}

const SubjectThumbnail: React.FC<SubjectThumbnailProps> = ({ subject, imageUrl }) => {
  return (
    <div className="relative w-full h-48 mb-6">
  <Image
    src={imageUrl}
    alt={subject}
    className="object-cover w-full h-full rounded-md"
    layout="fill" // Use layout fill for responsive images
    objectFit="cover" // Ensures the image covers the entire area
  />
  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <h3 className="text-white text-2xl font-bold">{subject}</h3>
  </div>
</div>
  );
};

export default SubjectThumbnail;
