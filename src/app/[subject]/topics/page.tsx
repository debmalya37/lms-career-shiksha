"use client";
import { useParams } from 'next/navigation';

export default function TopicsPage() {
  const { subject } = useParams();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Topics for {subject}</h1>
      <p>List or display topics for {subject} here.</p>
    </div>
  );
}
