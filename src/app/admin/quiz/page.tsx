"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

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
  course: string;
  subject: string;
  negativeMarking: number;
  totalTime: number;
  questions: Question[];
}

export default function AdminQuizPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [negativeMarking, setNegativeMarking] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Fetch Courses
  const fetchCourses = useCallback(async () => {
    try {
      const response = await axios.get(`/api/course`);
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  }, []);

  // Fetch Quizzes
  const fetchQuizzes = useCallback(async () => {
    try {
      const response = await axios.get(`/api/quiz`);
      setQuizzes(response.data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  }, []);

  // Fetch Subjects Based on Selected Course
  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find((course) => course._id === selectedCourse);
      setSubjects(course ? course.subjects : []);
    } else {
      setSubjects([]);
    }
  }, [selectedCourse, courses]);

  // Fetch Initial Data
  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, [fetchQuizzes, fetchCourses]);

  const addQuestion = () =>
    setQuestions([...questions, { question: "", answers: [], marks: 0, image: undefined }]);

  const addAnswer = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answers.push({ text: "", isCorrect: false });
    setQuestions(newQuestions);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, qIndex: number) => {
    if (e.target.files?.[0]) {
      const newQuestions = [...questions];
      newQuestions[qIndex].image = e.target.files[0];
      setQuestions(newQuestions);
    }
  };

  const handleEdit = (quiz: Quiz) => {
    setSelectedQuizId(quiz._id);
    setTitle(quiz.title);
    setSelectedCourse(quiz.course);
    setSelectedSubject(quiz.subject);
    setNegativeMarking(quiz.negativeMarking);
    setTotalTime(quiz.totalTime);
    setQuestions(
      quiz.questions.map((q) => ({ ...q, image: q.image || undefined }))
    );
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    if (selectedQuizId) formData.append("quizId", selectedQuizId);
    formData.append("title", title);
    formData.append("course", selectedCourse);
    formData.append("subject", selectedSubject);
    formData.append("negativeMarking", String(negativeMarking));
    formData.append("totalTime", String(totalTime));
    formData.append("questions", JSON.stringify(questions.map((q) => ({ ...q, image: undefined }))));

    questions.forEach((q, index) => {
      if (q.image instanceof File) {
        formData.append("questionImages", q.image, `question_${index}`);
      }
    });

    const endpoint = selectedQuizId ? `/api/quiz/edit` : `/api/quiz`;
    await axios.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert(selectedQuizId ? "Quiz updated successfully!" : "Quiz added successfully!");
    setSelectedQuizId(null); // Reset the form
    setTitle("");
    setSelectedCourse("");
    setSelectedSubject("");
    setNegativeMarking(0);
    setTotalTime(0);
    setQuestions([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-5">
      <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          {selectedQuizId ? "Edit Quiz" : "Create New Quiz"}
        </h2>
        {/* Form for creating or editing quizzes */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quiz Title"
            className="border p-2 rounded-md w-full"
          />
          <select
          title="courseselect"
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
          title="subjectselect"
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
            type="number"
            step="0.01" // Allow decimal values
            value={negativeMarking}
            onChange={(e) => setNegativeMarking(parseFloat(e.target.value))}
            placeholder="Negative Marking (e.g., -0.25)"
            className="border p-2 rounded-md w-full"
          />

          <input
            type="number"
            value={totalTime}
            onChange={(e) => setTotalTime(parseFloat(e.target.value))}
            placeholder="Total Time (minutes)"
            className="border p-2 rounded-md w-full"
          />
        </div>
        <button
          onClick={addQuestion}
          className="bg-blue-600 text-white py-2 px-4 rounded-md mb-6 hover:bg-blue-500 w-full"
        >
          Add Question
        </button>
        {/* Question and Answer Fields */}
        {questions.map((q, qIndex) => (
            <div key={qIndex} className="mb-4 p-4 border rounded-md bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Question {qIndex + 1}
              </h3>
              {/* Question Textarea */}
  <textarea
    value={q.question}
    onChange={(e) => {
      const newQuestions = [...questions];
      newQuestions[qIndex].question = e.target.value;
      setQuestions(newQuestions);
    }}
    placeholder="Type your question here..."
    className="border p-2 rounded-md w-full mb-4 resize-none"
    rows={3} // Adjust rows as needed
  />

  {/* Question Preview */}
  <div className="question-preview bg-gray-100 p-4 rounded-md">
    <h3 className="text-lg font-semibold text-gray-700 mb-2">Preview:</h3>
    <p
      style={{ whiteSpace: "pre-wrap" }} // Preserve spaces and line breaks
      className="text-gray-800"
    >
      {q.question}
    </p>
  </div>
              
              <input
                type="number"
                value={q.marks}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[qIndex].marks = parseFloat(e.target.value);
                  setQuestions(newQuestions);
                }}
                placeholder="Marks"
                className="border p-2 rounded-md w-full mb-4"
              />
              <input title="file" type="file" onChange={(e) => handleImageChange(e, qIndex)} />
              <button
                onClick={() => addAnswer(qIndex)}
                className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-400 mt-4"
              >
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
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    const newQuestions = questions.filter((_, index) => index !== qIndex);
                    setQuestions(newQuestions);
                  }}
                  className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-400"
                >
                  Delete Question
                </button>
              </div>
            </div>
          ))}

        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md mt-6 hover:bg-indigo-500 w-full"
        >
          {selectedQuizId ? "Update Quiz" : "Submit Quiz"}
        </button>
      </div>

      {/* Existing Quizzes Section */}
      <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Existing Quizzes</h2>
        <ul>
  {quizzes.map((quiz) => (
    <li
      key={quiz._id}
      className="flex justify-between items-center border-b py-2"
    >
      <div className="flex items-center">
        <img
          src={
            typeof quiz.questions[0]?.image === "string"
              ? quiz.questions[0]?.image
              : ""
          }
          alt="Quiz Preview"
          className="w-16 h-16 object-cover rounded-md mr-4"
        />
        <span>
          <strong>{quiz.title}</strong> - {quiz.course} - {quiz.totalTime} mins
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
            if (confirm('Are you sure you want to delete this quiz?')) {
              await axios.delete(`/api/quiz/delete?quizId=${quiz._id}`);
              setQuizzes((prev) => prev.filter((q) => q._id !== quiz._id));
              alert('Quiz deleted successfully!');
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
