// app/course/[courseId]/[subjectId]/[topicId]/page.tsx
import connectMongo from '@/lib/db';
import Tutorial from '@/models/tutorialModel';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function fetchTutorialsForTopic(topicId: string) {
  await connectMongo();
  const tutorials = await Tutorial.find({ topic: topicId }).select('title').lean();
  return tutorials;
}

export default async function TopicPage({ params }: { params: { courseId: string; subjectId: string; topicId: string } }) {
  const tutorials = await fetchTutorialsForTopic(params.topicId);

  return (
    <div className="container mx-auto py-8 min-h-screen bg-white text-black rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Tutorials in Topic</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tutorials.map((tutorial: any) => (
          <div key={tutorial._id} className="bg-white border border-gray-200 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-black mb-2">{tutorial.title}</h2>
            <Link href={`/courses/${params.courseId}/${params.subjectId}/${params.topicId}/${tutorial._id}`}>
              <span className="text-blue-500 hover:underline">View Tutorial</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
