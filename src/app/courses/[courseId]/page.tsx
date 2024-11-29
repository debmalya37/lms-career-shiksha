import connectMongo from '@/lib/db';
import Course, { ICourse } from '@/models/courseModel';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Fetch course with populated subjects
async function fetchSubjectsForCourse(courseId: string): Promise<ICourse | null> {
  await connectMongo();

  const course = await Course.findById(courseId)
    .populate({ path: 'subjects', select: 'name subjectImg' }) // Include 'subjectImg' in the population
    .lean();

  if (!course) {
    throw new Error('Course not found');
  }

  return course as ICourse;
}

export default async function CoursePage({ params }: { params: { courseId: string } }) {
  const course = await fetchSubjectsForCourse(params.courseId);

  if (!course) {
    return <div>Course not found.</div>;
  }

  const subjects = course.subjects || [];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Subjects in Course</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.length > 0 ? (
          subjects.map((subject: any) => (
            <Link
              key={subject._id}
              href={`/courses/${params.courseId}/${subject._id}`}
              className="block bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative w-full h-48">
                {subject.subjectImg ? (
                  <img
                    src={subject.subjectImg}
                    alt={subject.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="bg-gray-200 flex items-center justify-center h-full">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">{subject.name}</h2>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-600">
            No subjects found for this course.
          </div>
        )}
      </div>
    </div>
  );
}
