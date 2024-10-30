"use client";
import { useParams } from 'next/navigation';

export default function QueryPage() {
  const { subject } = useParams();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Query for {subject}</h1>
      <p>Allow students to post queries for {subject} here.</p>
    </div>
  );
}
