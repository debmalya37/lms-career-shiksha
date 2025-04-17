import connectMongo from '@/lib/db';
import Tutorial from '@/models/tutorialModel';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Function to fetch tutorials for a given topic
async function fetchTutorialsForTopic(topicId: string) {
  await connectMongo();
  return await Tutorial.find({ topic: topicId }).select('title').lean();
}

export default async function TopicPage({ params }: { params: { courseId: string; subjectId: string; topicId: string } }) {
  const tutorials = await fetchTutorialsForTopic(params.topicId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Main Heading */}
      <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-8">
        📖 Explore Tutorials
      </h1>

      {/* Tutorials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {tutorials.length > 0 ? (
          tutorials.map((tutorial: any, index: number) => (
            <Link
              key={tutorial._id}
              href={`/courses/${params.courseId}/${params.subjectId}/${params.topicId}/${tutorial._id}`}
              className={`relative block p-5 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg group ${
                index % 2 === 0 ? 'bg-pink-300' : 'bg-blue-900 text-white'
              }`}
            >
              {/* Floating Glass Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-50 group-hover:opacity-70 transition-opacity rounded-xl" />

              {/* Tutorial Title */}
              <h2 className="relative text-lg font-semibold text-center">
                {tutorial.title}
              </h2>

              {/* View Tutorial Button */}
              <div className="relative mt-3 text-center">
                <span className="inline-block bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-1.5 px-4 rounded-full text-sm font-medium tracking-wide transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                  View Tutorial →
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-600 dark:text-gray-400 text-lg">
            No tutorials available for this topic.
          </div>
        )}
      </div>
    </div>
  );
}

// Function for fetching topics by courseId and subjectId
async function fetchTopics(courseId: string, subjectId: string) {
  await connectMongo();
  return await Tutorial.find({ course: courseId, subject: subjectId }).distinct('topic').lean();
}

// Static params generation function
export async function generateStaticParams() {
  await connectMongo(); // Ensure connection to MongoDB

  const courses = await Tutorial.find({}).distinct('course').lean();
  const params: { courseId: any; subjectId: any; topicId: any }[] = [];

  for (const course of courses) {
    const subjects = await Tutorial.find({ course }).distinct('subject').lean();

    for (const subject of subjects) {
      const topics = await fetchTopics(course, subject);

      topics.forEach((topic) => {
        params.push({
          courseId: course,
          subjectId: subject,
          topicId: topic,
        });
      });
    }
  }
  return params;
}
