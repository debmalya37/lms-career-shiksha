// app/course/[courseId]/page.tsx
import connectMongo from '@/lib/db';
import Course, { ICourse } from '@/models/courseModel'; // Import the ICourse interface
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Fetch course with populated subjects
async function fetchSubjectsForCourse(courseId: string): Promise<ICourse | null> { // Specify return type
  await connectMongo();

  const course = await Course.findById(courseId)
    .populate({ path: 'subjects', select: 'name' }) // Populate 'subjects' array directly
    .lean();

  if (!course) {
    throw new Error('Course not found');
  }

  return course as ICourse; // Cast course to ICourse type
}

export default async function CoursePage({ params }: { params: { courseId: string } }) {
  const course = await fetchSubjectsForCourse(params.courseId);
  
  if (!course) {
    return <div>Course not found.</div>; // Handle case when course is not found
  }

  const subjects = course.subjects || [];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Subjects in Course</h1>
      <ul className="list-disc pl-5">
        {subjects.length > 0 ? (
          subjects.map((subject: any) => ( // You may want to create a proper interface for subjects too
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
