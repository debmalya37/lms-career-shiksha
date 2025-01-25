import connectMongo from '@/lib/db';
import Course, { ICourse } from '@/models/courseModel';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Define the Subject type explicitly
interface Subject {
  _id: string;
  name: string;
  subjectImg?: string;
  isHidden?: boolean;
}

// Extend the ICourse interface to include subjects as an array of Subject
interface ICourseWithSubjects extends Omit<ICourse, 'subjects'> {
  subjects: Subject[];
}

// Fetch course with populated subjects
async function fetchSubjectsForCourse(courseId: string): Promise<ICourseWithSubjects | null> {
  await connectMongo();

  // Fetch course and populate subjects
  const course = (await Course.findById(courseId)
    .populate({
      path: 'subjects',
      select: 'name subjectImg isHidden', // Ensure these fields are selected
    })
    .lean()) as ICourseWithSubjects | null;

  if (!course) {
    throw new Error('Course not found');
  }

  // Filter out hidden subjects
  if (course.subjects) {
    course.subjects = course.subjects.filter((subject) => !subject.isHidden);
  }

  return course;
}

export default async function CoursePage({ params }: { params: { courseId: string } }) {
  const course = await fetchSubjectsForCourse(params.courseId);

  if (!course) {
    return <div>Course not found.</div>;
  }

  const subjects = course.subjects || [];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Main Heading */}
      <h1 className="text-3xl font-bold mb-6 text-center">Subjects in Course</h1>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <Link
              key={subject._id}
              href={`/courses/${params.courseId}/${subject._id}`}
              className="block bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Subject Image */}
              <div className="relative aspect-w-16 aspect-h-9">
                {subject.subjectImg ? (
                  <img
                    src={subject.subjectImg}
                    alt={subject.name}
                    className="courseIdImg absolute inset-0 object-cover w-full h-full"
                  />
                ) : (
                  <div className="bg-gray-200 flex items-center justify-center w-full h-full">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </div>

              {/* Subject Content */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 truncate">{subject.name}</h2>
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
