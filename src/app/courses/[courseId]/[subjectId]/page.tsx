// app/course/[courseId]/[subjectId]/page.tsx
import connectMongo from '@/lib/db';
import Topic from '@/models/topicModel';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function fetchTopicsForSubject(subjectId: string) {
  await connectMongo();
  const topics = await Topic.find({ subject: subjectId }).select('name').lean();
  return topics;
}

export default async function SubjectPage({ params }: { params: { courseId: string; subjectId: string } }) {
  const topics = await fetchTopicsForSubject(params.subjectId);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Topics in Subject</h1>
      <ul className="list-disc pl-5">
        {topics.length > 0 ? (
          topics.map((topic: any) => (
            <li key={topic._id} className="mb-4">
              <Link href={`/courses/${params.courseId}/${params.subjectId}/${topic._id}`}>
                <span className="text-blue-500 hover:underline">{topic.name}</span>
              </Link>
            </li>
          ))
        ) : (
          <li>No topics found for this subject.</li>
        )}
      </ul>
    </div>
  );
}
