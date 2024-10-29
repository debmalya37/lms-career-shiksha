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
    <div className="container mx-auto py-8 text-black">
      <h1 className="text-3xl font-bold mb-6 text-black">Tutorials in Topic</h1>
      <ul className="list-disc pl-5">
        {tutorials.map((tutorial: any) => (
          <li key={tutorial._id} className="mb-4">
            <Link href={`/courses/${params.courseId}/${params.subjectId}/${params.topicId}/${tutorial._id}`}>
              <span className="text-blue-500 hover:underline">{tutorial.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
