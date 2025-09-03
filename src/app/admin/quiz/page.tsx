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
  questionType: 'mcq' | 'descriptive';
  answers: Answer[];
  marks: number;
  image?: File | string;
}

interface Quiz {
  _id: string;
  title: string;
  courses: string[];
  subjects: string[];
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
      { 
        question: "", 
        questionType: 'mcq',
        answers: [], 
        marks: 0, 
        image: undefined 
      },
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

  const handleQuestionTypeChange = (qIndex: number, type: 'mcq' | 'descriptive') => {
    const newQuestions = [...questions];
    newQuestions[qIndex].questionType = type;
    if (type === 'descriptive') {
      newQuestions[qIndex].answers = [];
    }
    setQuestions(newQuestions);
  };

  const handleEdit = (quiz: Quiz) => {
    setSelectedQuizId(quiz._id);
    setTitle(quiz.title);

    const validCourses = quiz.courses.filter((cid) =>
      courses.some((c) => c._id === cid)
    );
    setSelectedCourses(validCourses);

    const subjMap: Record<string, string> = {};
    validCourses.forEach((cid) => {
      const idx = quiz.courses.indexOf(cid);
      subjMap[cid] = quiz.subjects[idx] || "";
    });
    setSelectedSubjects(subjMap);

    setNegativeMarking(quiz.negativeMarking);
    setTotalTime(quiz.totalTime);
    setQuestions(
      quiz.questions.map((q) => ({ 
        ...q, 
        questionType: q.questionType || 'mcq',
        image: q.image || undefined 
      }))
    );
  };

  const handleSubmit = async () => {
    for (const cid of selectedCourses) {
      if (!selectedSubjects[cid]) {
        alert("Please select a subject for each selected course.");
        return;
      }
    }

    // Validate MCQ questions have answers
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].questionType === 'mcq' && questions[i].answers.length === 0) {
        alert(`MCQ Question ${i + 1} must have at least one answer.`);
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
    formData.append("questions", JSON.stringify(questions));
    
    questions.forEach((q, idx) => {
      if (q.image instanceof File) {
        formData.append(`questionImage_${idx}`, q.image, `question_${idx}`);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-5">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Quiz Management</h1>
          <p className="text-gray-600">Create and manage quizzes with MCQ and descriptive questions</p>
        </div>

        {/* Create/Edit Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-3xl">📝</span>
            {selectedQuizId ? "Edit Quiz" : "Create New Quiz"}
          </h2>

          <div className="space-y-6">
            {/* Quiz Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Courses Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Courses</label>
              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                {courses.map((c) => (
                  <label key={c._id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      checked={selectedCourses.includes(c._id)}
                      onChange={() =>
                        setSelectedCourses((prev) =>
                          prev.includes(c._id)
                            ? prev.filter((id) => id !== c._id)
                            : [...prev, c._id]
                        )
                      }
                    />
                    <span className="text-gray-700">{c.title}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Subjects Selection */}
            {selectedCourses.map((cid) => {
              const course = courses.find((c) => c._id === cid);
              if (!course) return null;
              
              return (
                <div key={cid} className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-medium text-gray-700 mb-2">
                    Select subject for <span className="text-blue-600">{course.title}</span>:
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {course.subjects.map((s) => (
                      <label key={s._id} className="flex items-center gap-3 cursor-pointer bg-white p-2 rounded hover:bg-blue-100 transition">
                        <input
                          type="radio"
                          name={`subject-${cid}`}
                          className="w-4 h-4 text-blue-600"
                          checked={selectedSubjects[cid] === s._id}
                          onChange={() =>
                            setSelectedSubjects((prev) => ({
                              ...prev,
                              [cid]: s._id,
                            }))
                          }
                        />
                        <span className="text-gray-700">{s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Quiz Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Negative Marking</label>
                <input
                  type="number"
                  step="0.01"
                  value={negativeMarking}
                  onChange={(e) => setNegativeMarking(parseFloat(e.target.value))}
                  placeholder="0.25"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Time (minutes)</label>
                <input
                  type="number"
                  value={totalTime}
                  onChange={(e) => setTotalTime(parseFloat(e.target.value))}
                  placeholder="60"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="mt-8">
            <button
              onClick={addQuestion}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-2 font-medium"
            >
              <span className="text-xl">➕</span> Add Question
            </button>

            {questions.map((q, qi) => (
              <div key={qi} className="mt-6 p-6 border-2 border-gray-200 rounded-xl bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Question {qi + 1}</h3>
                  <button
                    onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qi))}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Delete Question"
                  >
                    <span className="text-2xl">🗑️</span>
                  </button>
                </div>

                {/* Question Type Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`qtype-${qi}`}
                        checked={q.questionType === 'mcq'}
                        onChange={() => handleQuestionTypeChange(qi, 'mcq')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">MCQ</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`qtype-${qi}`}
                        checked={q.questionType === 'descriptive'}
                        onChange={() => handleQuestionTypeChange(qi, 'descriptive')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">Descriptive</span>
                    </label>
                  </div>
                </div>

                {/* Question Text */}
                <textarea
                  value={q.question}
                  onChange={(e) => {
                    const arr = [...questions];
                    arr[qi].question = e.target.value;
                    setQuestions(arr);
                  }}
                  placeholder="Enter your question here..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition resize-none"
                  rows={3}
                />

                {/* Question Preview */}
                <div className="mt-3 p-4 bg-white rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{q.question || "Question preview will appear here..."}</p>
                </div>

                {/* Image Upload */}
                <div className="mt-4 flex items-center gap-4">
                  {typeof q.image === "string" ? (
                    <img
                      src={q.image}
                      alt={`Question ${qi + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                      <span className="text-3xl">📷</span>
                    </div>
                  )}
                  <input
                  title="Upload Image"
                    type="file"
                    onChange={(e) => handleImageChange(e, qi)}
                    className="flex-1"
                    accept="image/*"
                  />
                </div>

                {/* Marks */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marks</label>
                  <input
                    type="number"
                    value={q.marks}
                    onChange={(e) => {
                      const arr = [...questions];
                      arr[qi].marks = parseFloat(e.target.value);
                      setQuestions(arr);
                    }}
                    placeholder="Enter marks"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                {/* MCQ Answers (only for MCQ type) */}
                {q.questionType === 'mcq' && (
                  <div className="mt-4">
                    <button
                      onClick={() => addAnswer(qi)}
                      className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition mb-3"
                    >
                      Add Answer Option
                    </button>

                    {q.answers.map((ans, ai) => (
                      <div key={ai} className="flex items-center gap-3 mb-2">
                        <input
                          value={ans.text}
                          onChange={(e) => {
                            const arr = [...questions];
                            arr[qi].answers[ai].text = e.target.value;
                            setQuestions(arr);
                          }}
                          placeholder={`Answer option ${ai + 1}`}
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                        />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ans.isCorrect}
                            onChange={(e) => {
                              const arr = [...questions];
                              arr[qi].answers[ai].isCorrect = e.target.checked;
                              setQuestions(arr);
                            }}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-sm text-gray-700">Correct</span>
                        </label>
                        <button
                          onClick={() => {
                            const arr = [...questions];
                            arr[qi].answers.splice(ai, 1);
                            setQuestions(arr);
                          }}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Answer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Descriptive Answer Info */}
                {q.questionType === 'descriptive' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      <span className="font-semibold">ℹ️ Descriptive Question:</span> Students will provide a written answer that will be reviewed by teachers.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-semibold text-lg"
          >
            {selectedQuizId ? "Update Quiz" : "Create Quiz"}
          </button>
        </div>

        {/* Existing Quizzes */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-3xl">📚</span>
            Existing Quizzes
          </h2>
          
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {typeof quiz.questions[0]?.image === 'string' ? (
                      <img
                        src={quiz.questions[0].image}
                        alt="Quiz"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📝</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800">{quiz.title}</h3>
                      <p className="text-sm text-gray-600">
                        {quiz.courses.map((cid) => courses.find((c) => c._id === cid)?.title).filter(Boolean).join(', ')}
                        {' • '}
                        {quiz.totalTime} mins
                        {' • '}
                        {quiz.questions.length} questions
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(quiz)}
                      className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this quiz?')) {
                          await axios.delete(`/api/quiz/delete?quizId=${quiz._id}`);
                          setQuizzes((prev) => prev.filter((q) => q._id !== quiz._id));
                          alert('Quiz deleted successfully');
                        }
                      }}
                      className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}