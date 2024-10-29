// app/courses/page.tsx
import connectMongo from '@/lib/db';
import Course from '@/models/courseModel';
import Subject from '@/models/subjectModel';
import Topic from '@/models/topicModel';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Fetch courses and related data without using populate
async function fetchCoursesWithSubjectsAndTopics() {
  await connectMongo();

  // Fetch all courses without populating subject and topic fields
  const courses = await Course.find({}).lean();

  // Collect unique subject and topic IDs from courses
  const subjectIds = Array.from(new Set(courses.map((course: any) => course.subject.toString())));
  const topicIds = Array.from(new Set(courses.map((course: any) => course.topic.toString())));

  // Fetch the relevant subjects and topics
  const subjects = await Subject.find({ _id: { $in: subjectIds } }).select('name').lean();
  const topics = await Topic.find({ _id: { $in: topicIds } }).select('name').lean();

  // Create lookup objects for quick access to subject and topic names by ID
  const subjectLookup = subjects.reduce((acc, subject) => {
    acc[subject._id.toString()] = subject.name;
    return acc;
  }, {} as Record<string, string>);

  const topicLookup = topics.reduce((acc, topic) => {
    acc[topic._id.toString()] = topic.name;
    return acc;
  }, {} as Record<string, string>);

  // Map through courses and add subject and topic names from lookups
  const coursesWithDetails = courses.map((course: any) => ({
    ...course,
    subjectName: subjectLookup[course.subject.toString()] || 'Unknown Subject',
    topicName: topicLookup[course.topic.toString()] || 'Unknown Topic',
  }));

  return coursesWithDetails;
}

export default async function GlobalCoursesPage() {
  const courses = await fetchCoursesWithSubjectsAndTopics();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-6">All Courses</h1>

      {/* Courses Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length > 0 ? (
          courses.map((course: any) => (
            <div key={course._id} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-700 mb-2">{course.description}</p>
              <p className="text-gray-500 mb-2">Created on: {new Date(course.createdAt).toLocaleDateString()}</p>
              <p className="text-gray-500">Subject: {course.subjectName}</p>
              <p className="text-gray-500">Topic: {course.topicName}</p>
              
              {/* View Button to redirect to the course-specific page */}
              <Link href={`/courses/${course._id}`}>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                  View
                </button>
              </Link>
            </div>
          ))
        ) : (
          <p>No courses found.</p>
        )}
      </div>
    </div>
  );
}
