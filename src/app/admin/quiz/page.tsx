// admin/quiz/page.tsx
"use client";
import { useState, useEffect } from "react";
import axios from "axios";

// Define types for Course, Subject, Answer, and Question
interface Course {
  _id: string;
  title: string;
}

interface Subject {
  _id: string;
  name: string;
}

interface Answer {
  text: string;
  isCorrect: boolean;
}

interface Question {
  question: string;
  answers: Answer[];
}

export default function AdminQuizPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [title, setTitle] = useState("");
  const [negativeMarking, setNegativeMarking] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Fetch courses on initial render
  useEffect(() => {
    async function fetchCourses() {
      const response = await axios.get("/api/course");
      setCourses(response.data);
    }
    fetchCourses();
  }, []);

  // Fetch subjects based on selected course
  useEffect(() => {
    if (selectedCourse) {
      const fetchSubjects = async () => {
        try {
          const response = await axios.get(`/api/subjects?course=${selectedCourse}`);
          setSubjects(response.data);
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
      };
      fetchSubjects();
    }
  }, [selectedCourse]);

  const addQuestion = () => setQuestions([...questions, { question: "", answers: [] }]);

  const addAnswer = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answers.push({ text: "", isCorrect: false });
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    await axios.post("/api/quiz", {
      title,
      course: selectedCourse,
      subject: selectedSubject,
      questions,
      negativeMarking,
      totalTime,
    });
    alert("Quiz added successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-5">
      <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Create New Quiz</h2>

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quiz Title"
            className="border p-2 rounded-md w-full"
          />
          <select
          title="selectedCourse"
            className="border p-2 rounded-md w-full"
            onChange={(e) => setSelectedCourse(e.target.value)}
            value={selectedCourse}
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>

          <select
          title="selectedSub"
            className="border p-2 rounded-md w-full"
            onChange={(e) => setSelectedSubject(e.target.value)}
            value={selectedSubject}
            disabled={!selectedCourse}
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>

          <input
          title="marking"
            type="number"
            value={negativeMarking}
            
            onChange={(e) => setNegativeMarking(parseFloat(e.target.value))}
            placeholder="Negative Marking"
            className="border p-2 rounded-md w-full placeholder-red-300"
          />
          <input
          title="total-time"
            type="number"
            value={totalTime}
            
            onChange={(e) => setTotalTime(parseFloat(e.target.value))}
            placeholder="Total Time (minutes)"
            className="border p-2 rounded-md w-full placeholder-red-300"
          />
        </div>

        <button onClick={addQuestion} className="bg-blue-600 text-white py-2 px-4 rounded-md mb-6 hover:bg-blue-500 w-full">
          Add Question
        </button>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="mb-4 p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Question {qIndex + 1}</h3>
            <input
              value={q.question}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[qIndex].question = e.target.value;
                setQuestions(newQuestions);
              }}
              placeholder="Question"
              className="border p-2 rounded-md w-full mb-4"
            />
            <button onClick={() => addAnswer(qIndex)} className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-400">
              Add Answer
            </button>

            {q.answers.map((answer, aIndex) => (
              <div key={aIndex} className="mt-4 flex items-center">
                <input
                  value={answer.text}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[qIndex].answers[aIndex].text = e.target.value;
                    setQuestions(newQuestions);
                  }}
                  placeholder="Answer"
                  className="border p-2 rounded-md w-full mr-2"
                />
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={answer.isCorrect}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[qIndex].answers[aIndex].isCorrect = e.target.checked;
                      setQuestions(newQuestions);
                    }}
                    className="mr-1"
                  />
                  Correct?
                </label>
              </div>
            ))}
          </div>
        ))}

        <button onClick={handleSubmit} className="bg-indigo-600 text-white py-2 px-4 rounded-md mt-6 hover:bg-indigo-500 w-full">
          Submit Quiz
        </button>
      </div>
    </div>
  );
}
