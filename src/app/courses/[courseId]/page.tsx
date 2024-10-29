// app/course/[courseId]/page.tsx
import connectMongo from '@/lib/db';
import Course from '@/models/courseModel';
import Subject from '@/models/subjectModel';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Fetch course with populated subject information
async function fetchSubjectsForCourse(courseId: string) {
  await connectMongo();

  const course = await Course.findById(courseId)
    .populate({ path: 'subject', select: 'name' })
    .lean();

  if (!course) {
    throw new Error('Course not found');
  }

  return course.subject ? [course.subject] : [];
}

export default async function CoursePage({ params }: { params: { courseId: string } }) {
  const subjects = await fetchSubjectsForCourse(params.courseId);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Subjects in Course</h1>
      <ul className="list-disc pl-5">
        {subjects.length > 0 ? (
          subjects.map((subject: any) => (
            <li key={subject._id} className="mb-4">
              <Link href={`/courses/${params.courseId}/${subject._id}`}>
                <span className="text-blue-500 hover:underline">{subject.name}</span>
              </Link>
            </li>
          ))
        ) : (
          <li>No subjects found for this course.</li>
        )}
      </ul>
    </div>
  );
}
