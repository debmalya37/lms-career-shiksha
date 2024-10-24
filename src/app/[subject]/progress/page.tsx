import { useParams } from 'next/navigation';

export default function ProgressPage() {
  const { subject } = useParams();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Progress for {subject}</h1>
      <p>Display the student's progress for {subject} here.</p>
    </div>
  );
}
