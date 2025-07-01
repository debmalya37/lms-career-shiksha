// app/course/[courseId]/[subjectId]/page.tsx
// app/course/[courseId]/[subjectId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import {
  BookmarkIcon,
  BookOpenIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { MoonIcon, SunIcon } from "lucide-react";

type Topic = { _id: string; name: string };
type Ebook = {
  _id: string;
  title: string;
  ebookImg?: string;
  url: string;
  subject: { name: string };
};
type Quiz = { _id: string; title: string; totalTime: number; negativeMarking: number };

export default function SubjectPage({ params }: { params: { courseId: string; subjectId: string } }) {
  const { courseId, subjectId } = params;
  const [topics, setTopics] = useState<Topic[]>([]);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [testSeries, setTestSeries] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  // Client‑only state for dark/light
  const [dark, setDark] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDark(true);
    }
  }, []);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark", !dark);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [t, e, q] = await Promise.all([
          axios.get<Topic[]>(`/api/topics?subject=${subjectId}`),
          axios.get<Ebook[]>(`/api/ebook?subject=${subjectId}`),
          axios.get<Quiz[]>(`/api/quiz?courseId=${courseId}&subjectId=${subjectId}`),
        ]);
        setTopics(t.data);
        setEbooks(e.data);
        setTestSeries(q.data);
      } catch {
        // silenty ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, subjectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <ClipLoader size={50} color="#2563eb" />
      </div>
    );
  }
  

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 sm:p-8">
      <button onClick={toggleDark} className="p-1">
          {dark
            ? <SunIcon className="w-6 h-6 text-yellow-400" />
            : <MoonIcon className="w-6 h-6 text-gray-600" />}
        </button>
      {/* Breadcrumb */}
      <nav className="text-sm mb-6 text-gray-600 dark:text-gray-400">
        <Link href="/" className="hover:underline">Home</Link> /{" "}
        <Link href={`/courses/${courseId}`} className="hover:underline">Course</Link> /{" "}
        <span className="font-semibold text-gray-900 dark:text-white">Subject</span>
      </nav>

      {/* Hero */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
          Explore This Subject
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Dive into topics, download eBooks or take a test series.
        </p>
      </header>

      {/* Topics */}
      <section className="mb-12">
        <div className="flex items-center mb-6">
          <BookOpenIcon className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Topics</h2>
        </div>
        {topics.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((t) => (
              <Link
                key={t._id}
                href={`/courses/${courseId}/${subjectId}/${t._id}`}
                className="bg-blue-100 dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl hover:scale-110 transition p-6 flex flex-col"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t.name}
                </h3>
                <button className="mt-auto inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                  View Topic →
                </button>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No topics available.
          </p>
        )}
      </section>

      {/* eBooks */}
      <section className="mb-12">
        <div className="flex items-center mb-6">
          <DocumentTextIcon className="w-6 h-6 text-green-600 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">eBooks</h2>
        </div>
        {ebooks.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ebooks.map((eb) => (
              <div
                key={eb._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition overflow-hidden flex flex-col"
              >
                <div className="relative w-full aspect-w-9 aspect-h-16 bg-gray-300 dark:bg-gray-700">
                  {eb.ebookImg ? (
                    <img
                      src={eb.ebookImg}
                      alt={eb.title}
                      className="object-cover w-full h-full transition-transform hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No Cover
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {eb.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {eb.subject.name}
                  </p>
                  <a
                    href={eb.url}
                    target="_blank"
                    rel="noopener"
                    className="mt-auto inline-block text-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                  >
                    View eBook →
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No eBooks found.
          </p>
        )}
      </section>

      {/* Test Series */}
      <section>
        <div className="flex items-center mb-6">
          <BookmarkIcon className="w-6 h-6 text-pink-600 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Test Series</h2>
        </div>
        {testSeries.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testSeries.map((q) => (
              <div
                key={q._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition p-6 flex flex-col"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {q.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  ⏳ {q.totalTime} min &nbsp;|&nbsp; ❌ {q.negativeMarking} neg.
                </p>
                <Link
                  href={`/quiz?quizId=${q._id}&courseId=${courseId}&subjectId=${subjectId}`}
                  className="mt-auto inline-block text-center px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition"
                >
                  Start Test →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No test series available.
          </p>
        )}
      </section>
    </main>
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
