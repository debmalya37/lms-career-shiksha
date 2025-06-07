"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import ClipLoader from "react-spinners/ClipLoader";

type Answer = {
  text: string;
  isCorrect: boolean;
};

type Question = {
  question: string;
  answers: Answer[];
  marks: number;
  image?: string;
};

type QuizData = {
  _id: string;
  title: string;
  totalTime: number;
  negativeMarking: number;
  questions: Question[];
};

type Course = {
  _id: string;
  title: string;
};

type Subject = {
  _id: string;
  name: string;
};

type UserProfile = {
  name: string;
  email: string;
};

type QuizState = {
  currentQuestion: number;
  score: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  showResults: boolean;
  timeLeft: number;
  isLoading: boolean;
  quizData: QuizData | null;
  answers: Array<string | null>;
  visitedQuestions: boolean[];
  incorrectQuestions: { question: string; correctAnswer: string; userAnswer: string }[];
};

function QuizAppContent() {
  const searchParams = useSearchParams();
  const quizId = searchParams.get("quizId") || "";
  const initialCourseId = searchParams.get("courseId") || "";
  const initialSubjectId = searchParams.get("subjectId") || "";

  const [state, setState] = useState<QuizState>({
    currentQuestion: 0,
    score: 0,
    correctCount: 0,
    incorrectCount: 0,
    skippedCount: 0,
    showResults: false,
    timeLeft: 0,
    isLoading: false,
    quizData: null,
    answers: [],
    visitedQuestions: [],
    incorrectQuestions: [],
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId);
  const [selectedSubject, setSelectedSubject] = useState(initialSubjectId);
  const resultsSent = useRef(false); // ✅ track if results are already sent

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/profile`);
        const profile = await response.json();
        setUserProfile({ name: profile.name, email: profile.email });
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`/api/course`);
        const data: Course[] = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Fetch subjects based on selected course
  useEffect(() => {
    if (selectedCourse) {
      const fetchSubjects = async () => {
        try {
          const response = await fetch(`/api/subjects?courseId=${selectedCourse}`);
          const data: Subject[] = await response.json();
          setSubjects(data);
        } catch (error) {
          console.error("Failed to fetch subjects:", error);
        }
      };
      fetchSubjects();
    }
  }, [selectedCourse]);

  // Fetch quiz data
  useEffect(() => {
    if (quizId && selectedCourse && selectedSubject) {
      const fetchQuizData = async () => {
        setState((prev) => ({ ...prev, isLoading: true }));
        try {
          const response = await fetch(
            `/api/quiz?quizId=${quizId}&courseId=${selectedCourse}&subjectId=${selectedSubject}`
          );
          const quizData: QuizData = await response.json();
          setState((prev) => ({
            ...prev,
            quizData,
            timeLeft: quizData.totalTime * 60,
            isLoading: false,
            answers: Array(quizData.questions.length).fill(null),
            visitedQuestions: Array(quizData.questions.length).fill(false),
          }));
        } catch (error) {
          console.error("Failed to fetch quiz data:", error);
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      };
      fetchQuizData();
    }
  }, [quizId, selectedCourse, selectedSubject]);

  // Countdown timer
  useEffect(() => {
    if (state.timeLeft > 0 && !state.showResults) {
      const timer = setInterval(() => {
        setState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
      return () => clearInterval(timer);
    } else if (state.timeLeft === 0 && state.quizData && !state.showResults) {
      const skippedCount = state.answers.filter((a) => !a).length;

      setState((prev) => ({
        ...prev,
        showResults: true,
        skippedCount,
      }));
    }
  }, [state.timeLeft, state.showResults, state.quizData]);

  // ✅ Send result once when results are shown
  useEffect(() => {
    const sendResultsByEmail = async () => {
      if (!state.quizData || !userProfile || resultsSent.current) return;

      const payload = {
        quizTitle: state.quizData.title,
        quizId,
        courseId: selectedCourse,
        subjectId: selectedSubject,
        score: state.score,
        correctAnswers: state.correctCount,
        incorrectAnswers: state.incorrectCount,
        userName: userProfile.name,
        userEmail: userProfile.email,
      };

      try {
        await fetch(`/api/sendQuizResults`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        await fetch(`/api/leaderboard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        resultsSent.current = true; // ✅ Mark as sent
      } catch (error) {
        console.error("Failed to send results:", error);
      }
    };

    if (state.showResults && !resultsSent.current) {
      sendResultsByEmail();
    }
  }, [state.showResults, state.quizData, state.score, state.correctCount, state.incorrectCount, quizId, selectedCourse, selectedSubject, userProfile]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleAnswerClick = (isCorrect: boolean, userAnswer: string) => {
    const idx = state.currentQuestion;
    if (state.answers[idx] !== null || !state.quizData) return;

    const question = state.quizData.questions[idx];
    const correctAnswer = question.answers.find((a) => a.isCorrect)?.text || "N/A";
    const marks = question.marks;

    let score = state.score;
    let correct = state.correctCount;
    let incorrect = state.incorrectCount;

    if (isCorrect) {
      score += marks;
      correct++;
    } else {
      score -= state.quizData.negativeMarking;
      incorrect++;
    }

    const updatedAnswers = [...state.answers];
    updatedAnswers[idx] = userAnswer;

    const updatedVisited = [...state.visitedQuestions];
    updatedVisited[idx] = true;

    const newIncorrectQuestions = isCorrect
      ? state.incorrectQuestions
      : [
          ...state.incorrectQuestions,
          { question: question.question, correctAnswer, userAnswer },
        ];

    setState((prev) => ({
      ...prev,
      answers: updatedAnswers,
      visitedQuestions: updatedVisited,
      score,
      correctCount: correct,
      incorrectCount: incorrect,
      incorrectQuestions: newIncorrectQuestions,
    }));
  };

  const navigateQuestion = (direction: "next" | "prev") => {
    const isLast = state.currentQuestion === (state.quizData?.questions.length || 0) - 1;

    if (direction === "next" && isLast) {
      const skippedCount = state.answers.filter((a) => !a).length;
      setState((prev) => ({
        ...prev,
        showResults: true,
        skippedCount,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      currentQuestion:
        direction === "next"
          ? Math.min(prev.currentQuestion + 1, prev.quizData?.questions.length! - 1)
          : Math.max(prev.currentQuestion - 1, 0),
    }));
  };

  const resetQuiz = () => {
    resultsSent.current = false; // ✅ Reset flag
    setState((prev) => ({
      ...prev,
      currentQuestion: 0,
      score: 0,
      correctCount: 0,
      incorrectCount: 0,
      skippedCount: 0,
      showResults: false,
      timeLeft: (prev.quizData?.totalTime ?? 0) * 60,
      incorrectQuestions: [],
      answers: Array(prev.quizData?.questions.length || 0).fill(null),
      visitedQuestions: Array(prev.quizData?.questions.length || 0).fill(false),
    }));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Timer: {state.timeLeft > 0 ? formatTime(state.timeLeft) : "Time's up!"}
        </h2>
      </div>

      {state.isLoading ? (
        <div className="flex flex-col items-center">
          <ClipLoader />
          <p>Loading quiz, please wait...</p>
        </div>
      ) : state.showResults ? (
        <div className="bg-card p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          <p className="text-lg mb-2">Score: {state.score}</p>
          <p className="text-lg mb-2">Correct: {state.correctCount}</p>
          <p className="text-lg mb-2">Incorrect: {state.incorrectCount}</p>
          <p className="text-lg mb-2">Skipped: {state.skippedCount}</p>

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Review:</h3>
            <ul>
              {state.quizData?.questions.map((q, i) => {
                const userAns = state.answers[i];
                const correctAns = q.answers.find((a) => a.isCorrect)?.text || "N/A";
                const isCorrect = userAns === correctAns;

                return (
                  <li key={i} className="mb-4">
                    <p className="text-sm font-medium">Q{i + 1}: {q.question}</p>
                    <p className={`text-sm ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                      Your Answer: {userAns || "Skipped"}
                    </p>
                    <p className="text-sm">Correct Answer: {correctAns}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          <Button onClick={resetQuiz} className="w-full mt-4">Try Again</Button>
        </div>
      ) : (
        <div className="bg-card p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">
            Question {state.currentQuestion + 1}/{state.quizData?.questions.length}
          </h2>
          <p className="text-lg mb-4 whitespace-pre-wrap">
            {state.quizData?.questions[state.currentQuestion].question}
          </p>
          {state.quizData?.questions[state.currentQuestion].image && (
            <img
              src={state.quizData.questions[state.currentQuestion].image}
              alt="Question"
              className="w-full rounded-lg mb-4"
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            {state.quizData?.questions[state.currentQuestion].answers.map((a, i) => {
              const isSelected = state.answers[state.currentQuestion] === a.text;
              return (
                <Button
                  key={i}
                  onClick={() => handleAnswerClick(a.isCorrect, a.text)}
                  className={`w-full ${isSelected ? "bg-white text-blue-800 border-blue-800" : "bg-blue-800 text-white"}`}
                  disabled={state.answers[state.currentQuestion] !== null}
                >
                  {a.text}
                </Button>
              );
            })}
          </div>
          <div className="flex justify-between mt-4">
            <Button onClick={() => navigateQuestion("prev")}>Previous</Button>
            <Button onClick={() => navigateQuestion("next")}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizApp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuizAppContent />
    </Suspense>
  );
}
