// components/SimpleProgressBar.tsx
"use client";
interface SimpleProgressBarProps {
  progress: number;
}
export default function SimpleProgressBar({ progress }: SimpleProgressBarProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div
        className="bg-blue-600 h-4"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
