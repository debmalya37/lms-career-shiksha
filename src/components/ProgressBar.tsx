// components/ProgressBar.tsx
"use client";
import { useState, useEffect } from "react";

interface ProgressBarProps {
  courseId: string;
  userId:   string;
}

export default function ProgressBar({ courseId, userId }: ProgressBarProps) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/profile');
      if (!res.ok) return;
      const data = await res.json();
      const course = data.courses.find((c: any) => c._id === courseId);
      if (course) setPercent(course.progress.percent);
    })();
  }, [courseId]);

  return (
    <div className="w-full bg-gray-200 rounded-full h-4">
      <div
        className="bg-blue-600 h-4 rounded-full"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
