// app/course/[courseId]/[subjectId]/page.tsx
import Link from 'next/link';
import React from 'react';
import axios from 'axios';

// Fetch data function for topics, ebooks, and test series
async function fetchData(courseId: string, subjectId: string) {
  try {
    const [topicsResponse, ebooksResponse, testSeriesResponse] = await Promise.all([
      axios.get(`https://www.civilacademyapp.com/api/topics?subject=${subjectId}`).catch(() => ({ data: [] })),
      axios.get(`https://www.civilacademyapp.com/api/ebook?subject=${subjectId}`).catch(() => ({ data: [] })),
      axios.get(`https://www.civilacademyapp.com/api/test-series?course=${courseId}&subject=${subjectId}`).catch(() => ({ data: [] }))
    ]);

    return {
      topics: topicsResponse.data,
      ebooks: ebooksResponse.data,
      testSeries: testSeriesResponse.data,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { topics: [], ebooks: [], testSeries: [] };
  }
}

export default async function SubjectPage({ params }: { params: { courseId: string; subjectId: string } }) {
  const { courseId, subjectId } = params;
  const { topics, ebooks, testSeries } = await fetchData(courseId, subjectId);

  return (
    <div className="container mx-auto py-8 bg-white min-h-screen rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Topics, eBooks, and Test Series in Subject</h1>

      {/* Topics Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">Topics</h2>
        <ul className="list-disc pl-5 space-y-3">
          {topics.length > 0 ? (
            topics.map((topic: any) => (
              <li key={topic._id} className="text-black hover:text-blue-700">
                <Link href={`/courses/${courseId}/${subjectId}/${topic._id}`}>
                  <span>{topic.name}</span>
                </Link>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No topics found for this subject.</li>
          )}
        </ul>
      </div>

      {/* eBooks Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">eBooks</h2>
        <ul className="list-disc pl-5 space-y-3">
          {ebooks.length > 0 ? (
            ebooks.map((ebook: any) => (
              <li key={ebook._id} className="text-black hover:text-blue-700">
                <a href={ebook.url} target="_blank" rel="noopener noreferrer" className="underline">
                  {ebook.title}
                </a>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No eBooks found for this subject.</li>
          )}
        </ul>
      </div>

      {/* Test Series Section */}
      <div>
        <h2 className="text-2xl font-semibold text-green-700 mb-4">Test Series</h2>
        <ul className="list-disc pl-5 space-y-3">
          {testSeries.length > 0 ? (
            testSeries.map((test: any) => (
              <li key={test._id} className="text-black hover:text-blue-700">
                <a href={test.googleFormLink} target="_blank" rel="noopener noreferrer" className="underline">
                  {test.title}
                </a>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No Test Series found for this subject.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

// app/course/[courseId]/[subjectId]/page.tsx

// app/course/[courseId]/[subjectId]/page.tsx

async function fetchCourses() {
  try {
    const response = await axios.get('https://www.civilacademyapp.com/api/course', {
      validateStatus: function (status) {
        // Accept all status codes and handle them manually
        return status >= 200 && status < 300; 
      }
    });

    // Check if response is JSON
    if (response.headers['content-type']?.includes('application/json') && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.log("No valid JSON data or unexpected response format.");
      return []; // Return empty array if data is not JSON or is malformed
    }
  } catch (error) {
    // Catch and ignore errors such as 500 errors or unexpected HTML responses
    console.log("Handled fetch error, proceeding with empty course data.");
    return []; // Ignore errors and return empty array for the build process
  }
}



// app/course/[courseId]/[subjectId]/page.tsx

async function fetchSubjects(courseId: string) {
  try {
    const response = await axios.get(`https://www.civilacademyapp.com/api/subjects?course=${courseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subjects for course ${courseId}:`, error);
    return [];
  }
}

export async function generateStaticParams() {
  console.log("Starting to generate static params...");
  try {
    const courses = await fetchCourses();
    
    if (!Array.isArray(courses) || courses.length === 0) {
      console.log("No courses available for static generation");
      return []; // Return empty params array when no courses
    }

    const params: { courseId: string; subjectId: string; }[] = [];
    for (const course of courses) {
      const subjects = await fetchSubjects(course._id); // Ensure _id is used
      if (Array.isArray(subjects) && subjects.length > 0) {
        subjects.forEach(subject => {
          params.push({ courseId: course._id, subjectId: subject._id });
        });
      } else {
        console.log(`No subjects found for course ID ${course._id}`);
      }
    }

    return params; 
  } catch (error) {
    console.error("Error generating static params:", error);
    return []; // Ensure empty params if errors encountered
  }
}


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

