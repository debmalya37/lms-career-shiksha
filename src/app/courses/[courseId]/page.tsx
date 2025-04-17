import connectMongo from '@/lib/db';
import Course, { ICourse } from '@/models/courseModel';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Subject {
  _id: string;
  name: string;
  subjectImg?: string;
  isHidden?: boolean;
}

interface ICourseWithSubjects extends Omit<ICourse, 'subjects'> {
  subjects: Subject[];
}

async function fetchSubjectsForCourse(courseId: string): Promise<ICourseWithSubjects | null> {
  await connectMongo();

  const course = (await Course.findById(courseId)
    .populate({
      path: 'subjects',
      select: 'name subjectImg isHidden',
    })
    .lean()) as ICourseWithSubjects | null;

  if (!course) {
    throw new Error('Course not found');
  }

  if (course.subjects) {
    course.subjects = course.subjects.filter((subject) => !subject.isHidden);
  }

  return course;
}

export default async function CoursePage({ params }: { params: { courseId: string } }) {
  const course = await fetchSubjectsForCourse(params.courseId);

  if (!course) {
    return <div className="flex justify-center items-center h-screen text-red-500 text-lg">Course not found.</div>;
  }

  const subjects = course.subjects || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Main Heading */}
      <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-8">
        Explore Subjects 📚
      </h1>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <Link
              key={subject._id}
              href={`/courses/${params.courseId}/${subject._id}`}
              className="relative group block overflow-hidden rounded-xl shadow-lg transition-transform transform hover:-translate-y-2 bg-white dark:bg-gray-800"
            >
              {/* Subject Image */}
              <div className="relative w-full h-48 bg-black dark:bg-gray-700 rounded-t-xl overflow-hidden">
                {subject.subjectImg ? (
                  <img
                    src={subject.subjectImg}
                    alt={subject.name}
                    className="absolute inset-0 w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-300 dark:bg-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">No Image</span>
                  </div>
                )}
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />

              {/* Subject Name */}
              <div className="absolute bottom-4 left-4">
                <h2 className="text-lg font-semibold text-white shadow-lg">{subject.name}</h2>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-600 dark:text-gray-400 text-lg">
            No subjects found for this course.
          </div>
        )}
      </div>
    </div>
  );
}
