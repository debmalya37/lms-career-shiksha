
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 sm:p-8 lg:p-12">
      {/* Breadcrumb */}
      <nav className="text-sm mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 text-gray-600 dark:text-gray-400">
          <li>
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-1">/</span>
          </li>
          <li>
            <Link href="/courses" className="hover:underline">Courses</Link>
            <span className="mx-1">/</span>
          </li>
          <li className="font-semibold text-gray-900 dark:text-white">{course.title}</li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          {course.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Choose a subject below to dive deeper.
        </p>
      </header>

      {/* Subjects grid */}
      <section>
        {course.subjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {course.subjects.map((subject) => (
              <Link
                key={subject._id}
                href={`/courses/${course._id}/${subject._id}`}
                className="group block bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transform hover:shadow-xl hover:-translate-y-1 transition"
              >
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                  {subject.subjectImg ? (
                    <img
                      src={subject.subjectImg}
                      alt={subject.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {subject.name}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No subjects found for this course.
          </p>
        )}
      </section>
    </main>
  );
}
