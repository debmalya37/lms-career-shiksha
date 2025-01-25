"use client";
import { useState, useEffect, Suspense } from "react";
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
  image?: string; // Optional image field
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
  skippedCount: number; // Count skipped questions
  showResults: boolean;
  timeLeft: number;
  isLoading: boolean;
  quizData: QuizData | null;
  answers: Array<string | null>; // Tracks selected answers per question
  visitedQuestions: boolean[]; // Tracks if a question was visited
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
    answers: [], // Initialize with null for no answer
    visitedQuestions: [],
    incorrectQuestions: [],
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId);
  const [selectedSubject, setSelectedSubject] = useState(initialSubjectId);
  useEffect(() => {
    // Fetch user profile
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
  useEffect(() => {
    if (quizId && selectedCourse && selectedSubject) {
      const fetchQuizData = async () => {
        setState((prevState) => ({ ...prevState, isLoading: true }));
        try {
          const response = await fetch(
            `/api/quiz?quizId=${quizId}&courseId=${selectedCourse}&subjectId=${selectedSubject}`
          );
          const quizData: QuizData = await response.json();

          setState((prevState) => ({
            ...prevState,
            quizData,
            timeLeft: quizData ? quizData.totalTime * 60 : 0,
            isLoading: false,
            answers: Array(quizData.questions.length).fill(null), // Initialize answers array
            visitedQuestions: Array(quizData.questions.length).fill(false), // Initialize visited array
          }));
        } catch (error) {
          console.error("Failed to fetch quiz data:", error);
          setState((prevState) => ({ ...prevState, isLoading: false }));
        }
      };
      fetchQuizData();
    }
  }, [quizId, selectedCourse, selectedSubject]);
  useEffect(() => {
    if (state.timeLeft > 0 && !state.showResults) {
      const timer = setInterval(() => {
        setState((prevState) => ({
          ...prevState,
          timeLeft: prevState.timeLeft - 1,
        }));
      }, 1000);
  
      return () => clearInterval(timer); // Cleanup timer on unmount or update
    }
  
    if (state.timeLeft === 0 && state.quizData && !state.showResults) {
      setState((prevState) => ({
        ...prevState,
        showResults: true,
      }));
      sendResultsByEmail();
    }
  }, [state.timeLeft, state.showResults, state.quizData]);
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleAnswerClick = (isCorrect: boolean, userAnswer: string) => {
    const currentQuestionIndex = state.currentQuestion;
  
    // If the user has already answered this question, do nothing
    if (state.answers[currentQuestionIndex] !== null) return;
  
    const currentQuestion = state.quizData?.questions[currentQuestionIndex];
    if (!currentQuestion) return;
  
    const correctAnswer = currentQuestion.answers.find((ans) => ans.isCorrect)?.text || "N/A";
    const questionMarks = currentQuestion.marks;
  
    let updatedScore = state.score;
    let updatedIncorrectCount = state.incorrectCount;
    let updatedCorrectCount = state.correctCount;
  
    // Calculate the score based on the answer
    if (userAnswer) {
      if (isCorrect) {
        updatedScore += questionMarks;
        updatedCorrectCount += 1;
      } else {
        updatedScore -= state.quizData?.negativeMarking ?? 0;
        updatedIncorrectCount += 1;
  
        setState((prevState) => ({
          ...prevState,
          incorrectQuestions: [
            ...prevState.incorrectQuestions,
            { question: currentQuestion.question, correctAnswer, userAnswer },
          ],
        }));
      }
    }
  
    // Update the answer and visited status
    const updatedAnswers = [...state.answers];
    updatedAnswers[currentQuestionIndex] = userAnswer;
  
    const updatedVisitedQuestions = [...state.visitedQuestions];
    updatedVisitedQuestions[currentQuestionIndex] = true;
  
    setState((prevState) => ({
      ...prevState,
      answers: updatedAnswers,
      visitedQuestions: updatedVisitedQuestions,
      score: updatedScore,
      correctCount: updatedCorrectCount,
      incorrectCount: updatedIncorrectCount,
    }));
  };
  

  const navigateQuestion = (direction: "next" | "prev") => {
    const isLastQuestion =
      state.currentQuestion === (state.quizData?.questions.length || 0) - 1;

    if (direction === "next" && isLastQuestion) {
      // Calculate skipped count
      const skippedCount = state.visitedQuestions.filter((v, index) => !v && !state.answers[index]).length;

      setState((prevState) => ({
        ...prevState,
        skippedCount,
        showResults: true,
      }));
      return;
    }

    setState((prevState) => ({
      ...prevState,
      currentQuestion:
        direction === "next"
          ? Math.min(prevState.currentQuestion + 1, prevState.quizData?.questions.length! - 1)
          : Math.max(prevState.currentQuestion - 1, 0),
    }));
  };

  const resetQuiz = () => {
    setState((prevState) => ({
      ...prevState,
      currentQuestion: 0,
      score: 0,
      correctCount: 0,
      incorrectCount: 0,
      skippedCount: 0,
      showResults: false,
      timeLeft: (prevState.quizData?.totalTime ?? 0) * 60,
      incorrectQuestions: [],
      answers: Array(prevState.quizData?.questions.length || 0).fill(null),
      visitedQuestions: Array(prevState.quizData?.questions.length || 0).fill(false),
    }));
  };
  const sendResultsByEmail = async () => {
    const payload = {
      quizTitle: state.quizData?.title || "",
      score: state.score,
      correctAnswers: state.correctCount,
      incorrectAnswers: state.incorrectCount,
      userName: userProfile?.name || "",
      userEmail: userProfile?.email || "",
    };

    try {
      await fetch(`/api/sendQuizResults`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Failed to send quiz results via email:", error);
    }
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
          <p className="text-lg mb-2">Correct Answers: {state.correctCount}</p>
          <p className="text-lg mb-2">Incorrect Answers: {state.incorrectCount}</p>
          <p className="text-lg mb-2">Skipped Questions: {state.skippedCount}</p>
      
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Review All Answers:</h3>
            <ul>
              {state.quizData?.questions.map((question, index) => {
                const userAnswer = state.answers[index];
                const correctAnswer = question.answers.find((ans) => ans.isCorrect)?.text || "N/A";
                const isCorrect = userAnswer === correctAnswer;
      
                return (
                  <li key={index} className="mb-4">
                    <p className="text-sm mb-1">
                      <strong>Q{index + 1}:</strong> {question.question}
                    </p>
                    <p className={`text-sm mb-1 ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                      <strong>Your Answer:</strong> {userAnswer || "Skipped"}
                    </p>
                    <p className="text-sm mb-1">
                      <strong>Correct Answer:</strong> {correctAnswer}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
      
          <Button onClick={resetQuiz} className="w-full mt-4">
            Try Again
          </Button>
        </div>
      )
       : (
        <div className="bg-card p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">
            Question {state.currentQuestion + 1}/{state.quizData?.questions.length}
          </h2>
          <p
              className="text-lg mb-4"
              style={{ whiteSpace: "pre-wrap" }} // Preserve line breaks and spaces
          >
              {state.quizData?.questions[state.currentQuestion].question}
          </p>

          {state.quizData?.questions[state.currentQuestion].image && (
            <img
              src={state.quizData?.questions[state.currentQuestion].image}
              alt="Question Image"
              className="w-full rounded-lg mb-4"
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            {state.quizData?.questions[state.currentQuestion].answers.map((answer, index) => {
              const isSelected = state.answers[state.currentQuestion] === answer.text;

              return (
                <Button
                  key={index}
                  onClick={() => handleAnswerClick(answer.isCorrect, answer.text)}
                  className={`w-full ${
                    isSelected
                      ? "bg-white text-blue-800 border-blue-800" // Selected style
                      : "bg-blue-800 text-white"
                  }`}
                  disabled={state.answers[state.currentQuestion] !== null} // Disable after selection
                >
                  {answer.text}
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
