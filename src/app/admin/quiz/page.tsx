"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "@/components/AdminSideBar";

interface Course {
  _id: string;
  title: string;
  subjects: Subject[];
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
  marks: number;
  image?: File | string; // For editing, it may already be a URL
}

interface Quiz {
  _id: string;
  title: string;
  courses: string[];      // renamed from course
  subjects: string[];     // renamed from subject
  negativeMarking: number;
  totalTime: number;
  questions: Question[];
}

export default function AdminQuizPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<Record<string, string>>({});
  const [negativeMarking, setNegativeMarking] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Fetch Courses and Quizzes
  const fetchCourses = useCallback(async () => {
    try {
      const response = await axios.get(`/api/course`);
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  }, []);

  const fetchQuizzes = useCallback(async () => {
    try {
      const response = await axios.get(`/api/quiz`);
      // Normalize backend fields: `course` -> `courses`, `subject` -> `subjects`
      const normalized: Quiz[] = response.data.map((q: any) => ({
        _id: q._id,
        title: q.title,
        courses: Array.isArray(q.course) ? q.course : [q.course],
        subjects: Array.isArray(q.subject) ? q.subject : [q.subject],
        negativeMarking: q.negativeMarking,
        totalTime: q.totalTime,
        questions: q.questions,
      }));
      setQuizzes(normalized);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchQuizzes();
  }, [fetchCourses, fetchQuizzes]);

  const addQuestion = () =>
    setQuestions([
      ...questions,
      { question: "", answers: [], marks: 0, image: undefined },
    ]);

  const addAnswer = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answers.push({ text: "", isCorrect: false });
    setQuestions(newQuestions);
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    qIndex: number
  ) => {
    if (e.target.files?.[0]) {
      const newQuestions = [...questions];
      newQuestions[qIndex].image = e.target.files[0];
      setQuestions(newQuestions);
    }
  };

  const handleEdit = (quiz: Quiz) => {
    setSelectedQuizId(quiz._id);
    setTitle(quiz.title);
    setSelectedCourses(quiz.courses);
    const subjMap: Record<string, string> = {};
    quiz.courses.forEach((cid, idx) => {
      subjMap[cid] = quiz.subjects[idx] || "";
    });
    setSelectedSubjects(subjMap);
    setNegativeMarking(quiz.negativeMarking);
    setTotalTime(quiz.totalTime);
    setQuestions(
      quiz.questions.map((q) => ({ ...q, image: q.image || undefined }))
    );
  };

  const handleSubmit = async () => {
    for (const cid of selectedCourses) {
      if (!selectedSubjects[cid]) {
        alert("Please select a subject for each selected course.");
        return;
      }
    }

    const formData = new FormData();
    if (selectedQuizId) formData.append("quizId", selectedQuizId);
    formData.append("title", title);
    selectedCourses.forEach((cid) => formData.append("courses", cid));
    selectedCourses.forEach((cid) => formData.append("subjects", selectedSubjects[cid]));
    formData.append("negativeMarking", String(negativeMarking));
    formData.append("totalTime", String(totalTime));
    formData.append(
      "questions",
      JSON.stringify(
        questions.map((q) => ({ ...q, image: undefined }))
      )
    );
    questions.forEach((q, idx) => {
      if (q.image instanceof File) {
        formData.append("questionImages", q.image, `question_${idx}`);
      }
    });

    const endpoint = selectedQuizId ? "/api/quiz/edit" : "/api/quiz";
    await axios.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert(selectedQuizId ? "Quiz updated!" : "Quiz created!");
    setSelectedQuizId(null);
    setTitle("");
    setSelectedCourses([]);
    setSelectedSubjects({});
    setNegativeMarking(0);
    setTotalTime(0);
    setQuestions([]);
    fetchQuizzes();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-5">
      {/* <Sidebar /> */}
      <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          {selectedQuizId ? "Edit Quiz" : "Create New Quiz"}
        </h2>

        <div className="grid gap-4 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quiz Title"
            className="border p-2 rounded-md w-full"
          />

<div>
  <label className="block font-medium mb-1">Courses</label>
  <div className="grid grid-cols-2 gap-2">
    {courses.map((c) => ( 
      <label key={c._id} className="flex items-center gap-2">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={selectedCourses.includes(c._id)}
          onChange={() =>
            setSelectedCourses((prev) =>
              prev.includes(c._id)
                ? prev.filter((id) => id !== c._id)
                : [...prev, c._id]
            )
          }
        />
        <span className="select-none">{c.title}</span>
      </label>
    ))}
  </div>
</div>


          {selectedCourses.map((cid) => {
  const course = courses.find((c) => c._id === cid)!;
  return (
    <div key={cid} className="mt-4">
      <div className="font-medium">Subjects for <em>{course.title}</em>:</div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {course.subjects.map((s) => (
          <label key={s._id} className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={selectedSubjects[cid] === s._id}
              onChange={() =>
                setSelectedSubjects((prev) => ({
                  ...prev,
                  [cid]:
                    prev[cid] === s._id
                      ? ""               // uncheck if same
                      : s._id,          // check new one
                }))
              }
            />
            <span className="select-none">{s.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
})}

          <input
            type="number"
            step="0.01"
            value={negativeMarking}
            onChange={(e) => setNegativeMarking(parseFloat(e.target.value))}
            placeholder="Negative Marking"
            className="border p-2 rounded-md w-full"
          />
          <input
            type="number"
            value={totalTime}
            onChange={(e) => setTotalTime(parseFloat(e.target.value))}
            placeholder="Total Time (mins)"
            className="border p-2 rounded-md w-full"
          />
        </div>

        <button
          onClick={addQuestion}
          className="bg-blue-600 text-white py-2 px-4 rounded-md mb-6 hover:bg-blue-500 w-full"
        >
          Add Question
        </button>

        {questions.map((q, qi) => (
          <div key={qi} className="mb-4 p-4 border rounded-md bg-gray-50">
            <h3 className="font-semibold mb-2">Question {qi + 1}</h3>
            <label htmlFor={`question-${qi}`} className="sr-only">
              Question {qi + 1}
            </label>
            <textarea
              id={`question-${qi}`}
              placeholder="Enter the question text"
              value={q.question}
              onChange={(e) => {
                const arr = [...questions];
                arr[qi].question = e.target.value;
                setQuestions(arr);
              }}
              rows={3}
              className="border p-2 rounded-md w-full mb-4 resize-none"
            />
            <div className="bg-gray-100 p-3 mb-4 rounded-md">
              <p className="whitespace-pre-wrap">{q.question}</p>
            </div>
            <input
              type="number"
              value={q.marks}
              onChange={(e) => {
                const arr = [...questions];
                arr[qi].marks = parseFloat(e.target.value);
                setQuestions(arr);
              }}
              placeholder="Marks"
              className="border p-2 rounded-md w-full mb-4"
            />
            <input
              type="file"
              onChange={(e) => handleImageChange(e, qi)}
              className="mb-4"
              title="Upload an image for the question"
            />
            <button
              onClick={() => addAnswer(qi)}
              className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-400"
            >
              Add Answer
            </button>
            {q.answers.map((ans, ai) => (
              <div key={ai} className="mt-3 flex items-center">
                <input
                  value={ans.text}
                  onChange={(e) => {
                    const arr = [...questions];
                    arr[qi].answers[ai].text = e.target.value;
                    setQuestions(arr);
                  }}
                  placeholder="Answer text"
                  className="border p-2 rounded-md flex-1 mr-2"
                />
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={ans.isCorrect}
                    onChange={(e) => {
                      const arr = [...questions];
                      arr[qi].answers[ai].isCorrect = e.target.checked;
                      setQuestions(arr);
                    }}
                    className="mr-1"
                  />
                  Correct
                </label>
              </div>
            ))}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() =>
                  setQuestions((prev) => prev.filter((_, i) => i !== qi))
                }
                className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-400"
              >
                Delete Question
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-500 w-full"
        >
          {selectedQuizId ? "Update Quiz" : "Submit Quiz"}
        </button>
      </div>

      {/* Existing Quizzes */}
      <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          Existing Quizzes
        </h2>
        <ul>
          {quizzes.map((quiz) => (
            <li key={quiz._id} className="border-b py-3 flex justify-between">
              <div className="flex items-center">
                <img
                  src={
                    typeof quiz.questions[0]?.image === 'string'
                      ? quiz.questions[0]?.image
                      : ''
                  }
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded-md mr-4"
                />
                <span>
                  <strong>{quiz.title}</strong> -{' '}
                  {
  quiz.courses.map((cid) => courses.find((c) => c._id === cid)?.title).join(', ')
}{' '}
                  - {quiz.totalTime} mins
                </span>
              </div>
              <div>
                <button
                  onClick={() => handleEdit(quiz)}
                  className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-400 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Delete this quiz?')) {
                      await axios.delete(`/api/quiz/delete?quizId=${quiz._id}`);
                      setQuizzes((prev) => prev.filter((q) => q._id !== quiz._id));
                      alert('Deleted');
                    }
                  }}
                  className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-400"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
