import connectMongo from '@/lib/db';
import Course from '@/models/courseModel';
import Link from 'next/link';
import { cookies } from 'next/headers';

async function fetchUserCourse() {
  // Fetch the user's profile to get the assigned course
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/profile`, {
    credentials: 'include',
    headers: {
      cookie: `sessionToken=${cookies().get('sessionToken')?.value || ''}`,
    },
  });
  const profile = await res.json();
  return profile.course?._id;
}

async function fetchCoursesWithSubjectsAndTopics(userCourseId: string) {
  await connectMongo();

  // Fetch and filter courses based on the user’s assigned course
  const courses = await Course.find({ _id: userCourseId })
    .populate({
      path: 'subjects',
      select: 'name',
    })
    .lean();

  return courses.map((course: any) => ({
    ...course,
    subjectNames: course.subjects.map((sub: any) => sub.name),
  }));
}

export default async function GlobalCoursesPage() {
  const userCourseId = await fetchUserCourse(); // Get the user's course ID
  const courses = userCourseId ? await fetchCoursesWithSubjectsAndTopics(userCourseId) : [];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-6">My Course</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length > 0 ? (
          courses.map((course: any) => (
            <div key={course._id} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-xl font-semibold mb-2 text-black">{course.title}</h3>
              <p className="text-gray-700 mb-2">{course.description}</p>
              <p className="text-gray-500 mb-2">Created on: {new Date(course.createdAt).toLocaleDateString()}</p>
              <p className="text-gray-500">Subjects: {course.subjectNames.join(', ')}</p>
              
              <Link href={`/courses/${course._id}`}>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                  View
                </button>
              </Link>
            </div>
          ))
        ) : (
          <p>No courses found for your profile.</p>
        )}
      </div>
    </div>
  );
}
