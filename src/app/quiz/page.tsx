"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import ClipLoader from "react-spinners/ClipLoader";

type Answer     = { text: string; isCorrect: boolean };
type Question   = { question: string; answers: Answer[]; marks: number; image?: string };
type QuizData   = { _id: string; title: string; totalTime: number; negativeMarking: number; questions: Question[] };
type UserProfile = { name: string; email: string };

function QuizAppContent() {
  const searchParams     = useSearchParams();
  const quizId           = searchParams.get("quizId") || "";
  const initialCourseId  = searchParams.get("courseId") || "";
  const initialSubjectId = searchParams.get("subjectId") || "";

  const [quizData, setQuizData] = useState<QuizData|null>(null);
  const [profile, setProfile]   = useState<UserProfile|null>(null);
  const [state, setState]       = useState({
    currentQuestion: 0,
    answers:         [] as (string|null)[],
    visited:         [] as boolean[],
    showResults:     false,
    timeLeft:        0,
    isLoading:       false,
    score:           0,
    correctCount:    0,
    incorrectCount:  0,
  });
  const resultsSent = useRef(false);

  // 1) load quiz & profile
  useEffect(() => {
    if (!quizId) return;
    async function load() {
      setState(s => ({ ...s, isLoading: true }));
      const [ q, p ] = await Promise.all([
        fetch(`/api/quiz?quizId=${quizId}&courseId=${initialCourseId}&subjectId=${initialSubjectId}`)
          .then(r => r.json()),
        fetch("/api/profile").then(r => r.json())
      ]);
      setQuizData(q);
      setProfile({ name: p.name, email: p.email });
      setState(s => ({
        ...s,
        isLoading: false,
        timeLeft:  q.totalTime * 60,
        answers:  Array(q.questions.length).fill(null),
        visited:  Array(q.questions.length).fill(false),
      }));
    }
    load();
  }, [quizId, initialCourseId, initialSubjectId]);

  // 2) timer
  useEffect(() => {
    if (state.timeLeft > 0 && !state.showResults) {
      const t = setTimeout(() => setState(s => ({ ...s, timeLeft: s.timeLeft - 1 })), 1000);
      return () => clearTimeout(t);
    }
    if (state.timeLeft === 0 && quizData && !state.showResults) {
      setState(s => ({ ...s, showResults: true }));
    }
  }, [state.timeLeft, state.showResults, quizData]);

  // 3) send once
  useEffect(() => {
    if (!state.showResults || resultsSent.current || !quizData || !profile) return;
    const payload = {
      quizTitle:    quizData.title,
      quizId,
      courseId:     initialCourseId,
      subjectId:    initialSubjectId,
      score:        state.score,
      correctAnswers: state.correctCount,
      incorrectAnswers: state.incorrectCount,
      userName:     profile.name,
      userEmail:    profile.email,
    };
    Promise.all([
      
      fetch("/api/leaderboard", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
      }),
      fetch("/api/sendQuizResults", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
      }),
    ]).finally(() => resultsSent.current = true);
  }, [state.showResults, quizData, profile]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec/60), s = sec%60;
    return `${m}:${s<10?"0":""}${s}`;
  };

  const handleAnswer = (isCorrect: boolean, text: string) => {
    const idx = state.currentQuestion;
    // allow changing answer any time before final results
    const answers = [...state.answers]; answers[idx] = text;
    const visited = [...state.visited]; visited[idx] = true;

    // recompute full score
    let score=0, correct=0, incorrect=0;
    quizData!.questions.forEach((q,i) => {
      const a = answers[i];
      if (!a) return;
      if (q.answers.find(x=>x.text===a)!.isCorrect) {
        score += q.marks; correct++;
      } else {
        score -= quizData!.negativeMarking; incorrect++;
      }
    });

    setState(s => ({
      ...s,
      answers, visited,
      score, correctCount: correct, incorrectCount: incorrect
    }));
  };

  const goto = (i:number) => setState(s=>({ ...s, currentQuestion: i }));

  if (state.isLoading || !quizData) {
    return <div className="flex justify-center mt-20"><ClipLoader/></div>;
  }

  // … inside QuizAppContent, replace the `if (state.showResults) { … }` block with this:

if (state.showResults) {
  const skippedCount = state.answers.filter(a => a === null).length;

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>

      {/* Score Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 text-sm sm:text-base">
        <div className="bg-green-100 p-4 rounded">
          <p className="font-semibold">Score</p>
          <p className="text-xl font-bold text-green-700">{state.score}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded">
          <p className="font-semibold">Correct Answers</p>
          <p className="text-xl font-bold text-blue-700">{state.correctCount}</p>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <p className="font-semibold">Incorrect Answers</p>
          <p className="text-xl font-bold text-red-700">{state.incorrectCount}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded">
          <p className="font-semibold">Skipped Questions</p>
          <p className="text-xl font-bold text-yellow-700">{skippedCount}</p>
        </div>
      </div>

      {/* Review Section */}
      <h3 className="text-lg font-semibold mb-3">Review Answers</h3>
      <ul className="space-y-4 text-sm sm:text-base">
        {quizData.questions.map((q, i) => {
          const userAns = state.answers[i];
          const correctAns = q.answers.find(a => a.isCorrect)?.text || "N/A";
          const isCorrect = userAns === correctAns;

          return (
            <li key={i} className="border-t pt-4">
              <p className="font-medium">Q{i + 1}. {q.question}</p>

              <p>
                Your answer:{" "}
                <span className={
                  userAns == null
                    ? "text-gray-500"
                    : isCorrect
                      ? "text-green-600"
                      : "text-red-600"
                }>
                  {userAns || "— skipped —"}
                </span>
              </p>

              {/* Always show the correct answer */}
              <p className="text-gray-700">
                Correct answer: <span className="font-semibold">{correctAns}</span>
              </p>
            </li>
          );
        })}
      </ul>

      <Button onClick={() => window.location.reload()} className="mt-6 w-full">
        Retake Quiz
      </Button>
    </div>
  );
}

  

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      
      {/* === Question & Answers Panel === */}
      <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Sticky Timer */}
        <div className="sticky top-0 z-10 bg-white p-4 mb-4 shadow-md rounded flex items-center justify-between">
          <h2 className="text-lg font-bold">🧭 Time Left:</h2>
          <span className="text-xl font-mono text-red-600">{formatTime(state.timeLeft)}</span>
        </div>

        {/* Question Box */}
        <div className="bg-white shadow rounded-lg p-6 transition-all duration-300">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">
            Q{state.currentQuestion + 1}/{quizData?.questions.length}

          </h3>
          <p className="text-lg mb-4 whitespace-pre-wrap">
            {quizData?.questions[state.currentQuestion].question}
          </p>

          {/* Optional Image */}
          {quizData.questions[state.currentQuestion].image && (
            <img
              src={quizData.questions[state.currentQuestion].image}
              alt="Question visual"
              className="w-full max-h-64 object-contain rounded mb-4 border"
            />
          )}

          {/* Answers */}
          <div className="space-y-3">
            {quizData.questions[state.currentQuestion].answers.map((ans, i) => {
              const isSelected = state.answers[state.currentQuestion] === ans.text;
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(ans.isCorrect, ans.text)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-base transition-all duration-200
                    ${isSelected
                      ? "bg-green-100 border-green-500 text-green-800 font-semibold shadow"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {ans.text}
                </button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between gap-4 flex-wrap">
            <Button
              onClick={() => goto(Math.max(state.currentQuestion - 1, 0))}
              disabled={state.currentQuestion === 0}
              className="w-full sm:w-auto"
            >
              ⬅ Previous
            </Button>
            <Button
              onClick={() => {
                if (state.currentQuestion === quizData.questions.length - 1) {
                  setState(s => ({ ...s, showResults: true }));
                } else goto(state.currentQuestion + 1);
              }}
              className="w-full sm:w-auto"
            >
              {state.currentQuestion === quizData.questions.length - 1 ? "✅ Submit Quiz" : "Next ➡"}
            </Button>
          </div>
        </div>
      </div>

      {/* === Question Map Sidebar === */}
      <div className="w-full lg:w-72 p-4 bg-white border-t lg:border-t-0 lg:border-l shadow-sm">
        <h4 className="font-semibold mb-3 text-center lg:text-left">🧩 Question Map</h4>
        <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-5 gap-2">
          {quizData.questions.map((_, i) => {
            let bg = "bg-gray-300";
            if (state.answers[i] != null) bg = "bg-green-500";
            else if (state.visited[i]) bg = "bg-yellow-400";

            return (
              <button
                key={i}
                onClick={() => goto(i)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white font-semibold hover:scale-105 transition transform ${bg}`}
                title={`Go to Q${i + 1}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function QuizApp(){
  return <Suspense fallback={<div>Loading…</div>}><QuizAppContent/></Suspense>;
}
