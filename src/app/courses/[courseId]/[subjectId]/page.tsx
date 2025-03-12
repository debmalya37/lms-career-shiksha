// app/course/[courseId]/[subjectId]/page.tsx
"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';

type Topic = {
  _id: string;
  name: string;
};

type Ebook = {
  _id: string;
  title: string;
  ebookImg?: string;
  url: string;
  subject: { name: string };
};

type Quiz = {
  _id: string;
  title: string;
  totalTime: number;
  negativeMarking: number;
};

export default function SubjectPage({ params }: { params: { courseId: string; subjectId: string } }) {
  const { courseId, subjectId } = params;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [testSeries, setTestSeries] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data using useEffect for client-side updates
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [topicsResponse, ebooksResponse, testSeriesResponse] = await Promise.all([
          axios.get(`/api/topics?subject=${subjectId}`),
          axios.get(`/api/ebook?subject=${subjectId}`),
          axios.get(`/api/quiz?courseId=${courseId}&subjectId=${subjectId}`)
        ]);

        setTopics(topicsResponse.data);
        setEbooks(ebooksResponse.data);
        setTestSeries(testSeriesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, subjectId]); // Dependencies ensure it re-fetches when courseId or subjectId changes

  if (loading) {
    return <p><ClipLoader /></p>;
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-white min-h-screen rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Topics, eBooks, and Test Series</h1>

      {/* Topics Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">Topics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.length > 0 ? (
            topics.map((topic) => (
              <div key={topic._id} className="bg-white border rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-bold text-black mb-2">{topic.name}</h3>
                <Link href={`/courses/${courseId}/${subjectId}/${topic._id}`}>
                  <button className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-md hover:bg-blue-600 w-full transition-colors">
                    View Topic
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No topics found for this subject.</p>
          )}
        </div>
      </div>

      {/* eBooks Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">eBooks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ebooks.length > 0 ? (
            ebooks.map((ebook) => (
              <div key={ebook._id} className="bg-white border rounded-lg shadow-lg overflow-hidden">
                {ebook.ebookImg && (
                  <img
                    src={ebook.ebookImg}
                    alt={ebook.title}
                    className="w-full h-48 object-cover object-center"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-black mb-2">{ebook.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{ebook.subject.name}</p>
                  <Link
                    href={ebook.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full block text-center transition-colors"
                  >
                    View eBook
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No eBooks found for this subject.</p>
          )}
        </div>
      </div>

      {/* Test Series Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">Test Series</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testSeries.length > 0 ? (
            testSeries.map((quiz) => (
              <div key={quiz._id} className="bg-white border rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-bold text-black mb-2">{quiz.title}</h3>
                <p className="text-gray-500 mb-2">Total Time: {quiz.totalTime} minutes</p>
                <p className="text-gray-500 mb-2">Negative Marking: {quiz.negativeMarking}</p>
                <Link href={`/quiz?quizId=${quiz._id}&courseId=${courseId}&subjectId=${subjectId}`}>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full transition-colors">
                    Go to Test
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No Test Series found for this subject.</p>
          )}
        </div>
      </div>
    </div>
  );
}


// app/course/[courseId]/[subjectId]/page.tsx

// app/course/[courseId]/[subjectId]/page.tsx

// async function fetchCourses() {
//   try {
//     const response = await axios.get('/api/course', {
//       validateStatus: function (status) {
//         // Accept all status codes and handle them manually
//         return status >= 200 && status < 300; 
//       }
//     });

//     // Check if response is JSON
//     if (response.headers['content-type']?.includes('application/json') && Array.isArray(response.data)) {
//       return response.data;
//     } else {
//       console.log("No valid JSON data or unexpected response format.");
//       return []; // Return empty array if data is not JSON or is malformed
//     }
//   } catch (error) {
//     // Catch and ignore errors such as 500 errors or unexpected HTML responses
//     console.log("Handled fetch error, proceeding with empty course data.");
//     return []; // Ignore errors and return empty array for the build process
//   }
// }



// // app/course/[courseId]/[subjectId]/page.tsx

// async function fetchSubjects(courseId: string) {
//   try {
//     const response = await axios.get(`/api/subjects?course=${courseId}`);
//     return response.data;
//   } catch (error) {
//     console.error(`Error fetching subjects for course ${courseId}:`, error);
//     return [];
//   }
// }

// export async function generateStaticParams() {
//   console.log("Starting to generate static params...");
//   try {
//     const courses = await fetchCourses();
    
//     if (!Array.isArray(courses) || courses.length === 0) {
//       console.log("No courses available for static generation");
//       return []; // Return empty params array when no courses
//     }

//     const params: { courseId: string; subjectId: string; }[] = [];
//     for (const course of courses) {
//       const subjects = await fetchSubjects(course._id); // Ensure _id is used
//       if (Array.isArray(subjects) && subjects.length > 0) {
//         subjects.forEach(subject => {
//           params.push({ courseId: course._id, subjectId: subject._id });
//         });
//       } else {
//         console.log(`No subjects found for course ID ${course._id}`);
//       }
//     }

//     return params; 
//   } catch (error) {
//     console.error("Error generating static params:", error);
//     return []; // Ensure empty params if errors encountered
//   }
// }


// export async function generateStaticParams() {
//   console.log("Starting to generate static params...");

//   try {
//     const courses = await fetchCourses();

//     // Handle case where courses are empty or unavailable
//     if (!Array.isArray(courses) || courses.length === 0) {
//       console.log("No courses available for static generation");
//       return [{ courseId: "default-course", subjectId: "default-subject" }]; // Provide a default or placeholder value
//     }

//     const params: { courseId: string; subjectId: string; }[] = [];
    
//     for (const course of courses) {
//       const subjects = await fetchSubjects(course._id); 
      
//       if (Array.isArray(subjects) && subjects.length > 0) {
//         subjects.forEach(subject => {
//           params.push({ courseId: course._id, subjectId: subject._id });
//         });
//       } else {
//         console.log(`No subjects found for course ID ${course._id}`);
//       }
//     }

//     // If no params were generated, return a placeholder or default value
//     return params.length > 0 ? params : [{ courseId: "default-course", subjectId: "default-subject" }];
//   } catch (error) {
//     console.error("Error generating static params:", error);
//     return [{ courseId: "default-course", subjectId: "default-subject" }]; // Return placeholder on error
//   }
// }
