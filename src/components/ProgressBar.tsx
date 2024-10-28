"use client";

interface ProgressBarProps {
  progress: number;
}

const ProgressBar = ({ progress }: ProgressBarProps) => (
  <div className="w-full bg-gray-200 rounded-full h-4">
    <div
      className="bg-blue-600 h-4 rounded-full"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

export default ProgressBar;
