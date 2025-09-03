"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import ClipLoader from "react-spinners/ClipLoader";

type Answer = { text: string; isCorrect: boolean };
type Question = { 
  _id: string; 
  question: string; 
  questionType: 'mcq' | 'descriptive';
  answers: Answer[]; 
  marks: number; 
  image?: string 
};
type QuizData = { 
  _id: string; 
  title: string; 
  totalTime: number; 
  negativeMarking: number; 
  questions: Question[] 
};
type UserProfile = { name: string; email: string; userId: string };

function QuizAppContent() {
  const searchParams     = useSearchParams();
  const quizId           = searchParams.get("quizId") || "";
  const initialCourseId  = searchParams.get("courseId") || "";
  const initialSubjectId = searchParams.get("subjectId") || "";

  const [quizData, setQuizData] = useState<QuizData|null>(null);
  const [profile, setProfile]   = useState<UserProfile|null>(null);
  const [state, setState]       = useState({
    currentQuestion: 0,
    answers:         [] as (string | string[] | null)[],
    descriptiveAnswers: [] as (string|null)[],
    visited:         [] as boolean[],
    showResults:     false,
    timeLeft:        0,
    isLoading:       false,
    score:           0,
    correctCount:    0,
    incorrectCount:  0,
  });
  const resultsSent = useRef(false);

  // Load quiz & profile
  useEffect(() => {
    if (!quizId) return;
    async function load() {
      setState(s => ({ ...s, isLoading: true }));
      const [ rawQuiz, p ] = await Promise.all([
        fetch(`/api/quiz?quizId=${quizId}&courseId=${initialCourseId}&subjectId=${initialSubjectId}`)
        .then(r => r.json()),
      fetch("/api/profile").then(r => r.json())
      ]);

// normalize questions so questionType is always present and answers is an array
const normalizedQuiz: QuizData = {
  ...rawQuiz,
  questions: (rawQuiz.questions || []).map((qq: any) => ({
    _id: qq._id,
    question: qq.question || "",
    // default to 'mcq' when missing or invalid
    questionType: qq.questionType === "descriptive" ? "descriptive" : "mcq",
    answers: Array.isArray(qq.answers) ? qq.answers : [],
    marks: typeof qq.marks === "number" ? qq.marks : (parseFloat(qq.marks) || 0),
    image: qq.image || undefined,
  })),
};

setQuizData(normalizedQuiz);
setProfile({ name: p.name, email: p.email, userId: p._id || p.id });
setState(s => ({
  ...s,
  isLoading: false,
  timeLeft:  normalizedQuiz.totalTime * 60,
  answers:  Array(normalizedQuiz.questions.length).fill(null),
  descriptiveAnswers: Array(normalizedQuiz.questions.length).fill(null),
  visited:  Array(normalizedQuiz.questions.length).fill(false),
}));

    }
    load();
  }, [quizId, initialCourseId, initialSubjectId]);

  // Timer
  useEffect(() => {
    if (state.timeLeft > 0 && !state.showResults) {
      const t = setTimeout(() => setState(s => ({ ...s, timeLeft: s.timeLeft - 1 })), 1000);
      return () => clearTimeout(t);
    }
    if (state.timeLeft === 0 && quizData && !state.showResults) {
      setState(s => ({ ...s, showResults: true }));
    }
  }, [state.timeLeft, state.showResults, quizData]);

  // Send results once
  useEffect(() => {
    // debug: show why the effect may early-return
    console.log("[quiz] send-results effect triggered", {
      showResults: state.showResults,
      resultsSent: resultsSent.current,
      hasQuizData: !!quizData,
      hasProfile: !!profile,
      answersLength: state.answers.length,
      descriptiveLength: state.descriptiveAnswers.length,
    });
  
    if (!state.showResults) {
      // not ready to send yet
      return;
    }
    if (resultsSent.current) {
      console.log("[quiz] results already sent, skipping");
      return;
    }
    if (!quizData) {
      console.warn("[quiz] no quizData available, skipping send");
      return;
    }
    if (!profile) {
      console.warn("[quiz] no profile available, skipping send");
      return;
    }
  
    const send = async () => {
      try {
        // compute MCQ score (defensive)
        let score = 0, correct = 0, incorrect = 0;
        quizData.questions.forEach((q, i) => {
          if (q.questionType === 'mcq') {
            const a = state.answers[i];
            if (a) {
              // support array or string selection
              if (Array.isArray(a)) {
                // if multi-select, count correct options present (simple heuristic)
                a.forEach(sel => {
                  const ansObj = q.answers.find(x => x.text === sel);
                  if (ansObj?.isCorrect) { score += q.marks / Math.max(1, q.answers.filter(x => x.isCorrect).length); correct++; }
                  else { incorrect++; score -= (quizData.negativeMarking || 0); }
                });
              } else {
                const selectedAnswer = q.answers.find(x => x.text === a);
                if (selectedAnswer?.isCorrect) {
                  score += q.marks;
                  correct++;
                } else {
                  score -= (quizData.negativeMarking || 0);
                  incorrect++;
                }
              }
            }
          }
        });
  
        // Build sanitized answers array
        const sanitizedAnswers = quizData.questions.map((q, i) => {
          const rawAns = state.answers[i];
          const selectedAnswer = Array.isArray(rawAns) ? rawAns : (rawAns ?? null);
          return {
            questionId: String(q._id ?? `q-${i}`),
            questionType: q.questionType ?? "mcq",
            selectedAnswer: q.questionType === "mcq" ? selectedAnswer : null,
            descriptiveAnswer: q.questionType === "descriptive" ? (state.descriptiveAnswers[i] ?? null) : null,
            marks: typeof q.marks === "number" ? q.marks : Number(q.marks) || 0,
            // derive isCorrect only for single-string selections; keep null otherwise
            isCorrect: q.questionType === "mcq" && !Array.isArray(selectedAnswer)
              ? !!(selectedAnswer && q.answers.find(a => a.text === selectedAnswer && a.isCorrect))
              : null
          };
        });
  
        const payload = {
          quizId: String(quizData._id),
          userId: String(profile.userId ?? (profile as any)._id ?? (profile as any).id ?? ""),
          userName: String(profile.name ?? ""),
          userEmail: String(profile.email ?? ""),
          courseId: initialCourseId ? String(initialCourseId) : undefined,
          subjectId: initialSubjectId ? String(initialSubjectId) : undefined,
          quizTitle: String(quizData.title ?? ""),
          answers: sanitizedAnswers,
          totalScore: score,
          maxScore: quizData.questions.reduce((s, q) => s + (q.marks ?? 0), 0),
          correctAnswers: correct,
          incorrectAnswers: incorrect,
          skippedQuestions: quizData.questions.filter((q, i) =>
            q.questionType === "mcq" ? !state.answers[i] : !state.descriptiveAnswers[i]
          ).length,
        };
  
        // show payload in console for debugging
        console.log("[quiz] sending payload:", payload);
  
        // send to endpoints and capture responses
        const endpoints = [
          { url: "/api/quiz-submission", name: "quiz-submission" },
          { url: "/api/leaderboard", name: "leaderboard" },
          { url: "/api/sendQuizResults", name: "sendQuizResults" },
        ];
  
        const responses = await Promise.all(
          endpoints.map(ep =>
            fetch(ep.url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }).then(async (res) => {
              const text = await res.text().catch(() => null);
              return { name: ep.name, ok: res.ok, status: res.status, text };
            }).catch(err => ({ name: ep.name, ok: false, status: 0, text: String(err) }))
          )
        );
  
        console.log("[quiz] POST responses:", responses);
  
        // log any non-ok responses
        responses.forEach(r => {
          if (!r.ok) {
            console.error(`[quiz] POST ${r.name} failed: status=${r.status} body=`, r.text);
          }
        });
      } catch (err) {
        console.error("[quiz] error while sending results:", err);
      } finally {
        // mark as sent so we don't spam attempts
        resultsSent.current = true;
        console.log("[quiz] resultsSent.current = true");
      }
    };
  
    // call send
    send();
  
  }, [state.showResults, quizData, profile, initialCourseId, initialSubjectId, state.answers, state.descriptiveAnswers]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec/60), s = sec%60;
    return `${m}:${s<10?"0":""}${s}`;
  };

  const handleMCQAnswer = (text: string) => {
    const idx = state.currentQuestion;
    const answers = [...state.answers]; 
    answers[idx] = text;
    const visited = [...state.visited]; 
    visited[idx] = true;

    setState(s => ({ ...s, answers, visited }));
  };

  const handleDescriptiveAnswer = (text: string) => {
    const idx = state.currentQuestion;
    const descriptiveAnswers = [...state.descriptiveAnswers]; 
    descriptiveAnswers[idx] = text;
    const visited = [...state.visited]; 
    visited[idx] = true;

    setState(s => ({ ...s, descriptiveAnswers, visited }));
  };

  const goto = (i: number) => setState(s => ({ ...s, currentQuestion: i }));

  if (state.isLoading || !quizData) {
    return <div className="flex justify-center mt-20"><ClipLoader/></div>;
  }

  // Results View
  if (state.showResults) {
    const mcqQuestions = quizData.questions.filter(q => q.questionType === 'mcq');
    const descriptiveQuestions = quizData.questions.filter(q => q.questionType === 'descriptive');
    const skippedCount = quizData.questions.filter((q, i) => 
      q.questionType === 'mcq' ? !state.answers[i] : !state.descriptiveAnswers[i]
    ).length;

    // Calculate MCQ score for display
    let displayScore = 0, displayCorrect = 0, displayIncorrect = 0;
    mcqQuestions.forEach((q) => {
      const qIndex = quizData.questions.indexOf(q);
      const userAns = state.answers[qIndex];
      if (userAns) {
        const selectedAnswer = q.answers.find(x => x.text === userAns);
        if (selectedAnswer?.isCorrect) {
          displayScore += q.marks;
          displayCorrect++;
        } else {
          displayScore -= quizData.negativeMarking;
          displayIncorrect++;
        }
      }
    });

    return (
      <div className="max-w-4xl mx-auto my-10 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Quiz Results</h2>

        {/* Score Summary */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-lg">
            <p className="font-semibold text-green-800">MCQ Score</p>
            <p className="text-2xl font-bold text-green-900">{displayScore.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-lg">
            <p className="font-semibold text-blue-800">Correct (MCQ)</p>
            <p className="text-2xl font-bold text-blue-900">{displayCorrect}</p>
          </div>
          <div className="bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-lg">
            <p className="font-semibold text-red-800">Incorrect (MCQ)</p>
            <p className="text-2xl font-bold text-red-900">{displayIncorrect}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 rounded-lg">
            <p className="font-semibold text-yellow-800">Skipped</p>
            <p className="text-2xl font-bold text-yellow-900">{skippedCount}</p>
          </div>
        </div>

        {descriptiveQuestions.length > 0 && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
            <p className="text-purple-800 font-semibold">
              {descriptiveQuestions.length} descriptive question(s) submitted for review
            </p>
            <p className="text-purple-600 text-sm mt-1">
              Your teacher will review and grade these answers
            </p>
          </div>
        )}

        {/* Review Section */}
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Review Your Answers</h3>
        <div className="space-y-6">
          {quizData.questions.map((q, i) => {
            const isMCQ = q.questionType === 'mcq';
            const userAns = isMCQ ? state.answers[i] : state.descriptiveAnswers[i];
            const correctAns = isMCQ ? q.answers.find(a => a.isCorrect)?.text : null;
            const isCorrect = isMCQ ? userAns === correctAns : null;

            return (
              <div key={i} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-gray-800">
                    Q{i + 1}. {q.question}
                  </p>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    isMCQ ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {q.questionType.toUpperCase()}
                  </span>
                </div>

                {q.image && (
                  <img src={q.image} alt="Question" className="w-48 h-32 object-cover rounded mb-2" />
                )}

                {isMCQ ? (
                  <>
                    <p className="mt-2">
                      Your answer:{" "}
                      <span className={
                        userAns == null
                          ? "text-gray-500 italic"
                          : isCorrect
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                      }>
                        {userAns || "— skipped —"}
                      </span>
                    </p>
                    <p className="text-gray-700">
                      Correct answer: <span className="font-semibold text-green-600">{correctAns}</span>
                    </p>
                  </>
                ) : (
                  <div className="mt-2">
                    <p className="text-gray-700 font-medium mb-1">Your answer:</p>
                    <div className="bg-white p-3 rounded border border-gray-300">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {userAns || <span className="text-gray-500 italic">— no answer provided —</span>}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Awaiting teacher review (Max marks: {q.marks})
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button 
          onClick={() => window.location.href = '/'} 
          className="mt-8 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // Quiz Taking View
  const currentQ = quizData.questions[state.currentQuestion];
  const isMCQ = currentQ.questionType === 'mcq';

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Question & Answers Panel */}
      <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Timer */}
        <div className="sticky top-0 z-10 bg-white p-4 mb-4 shadow-lg rounded-lg flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Time Left:</h2>
          <span className={`text-2xl font-mono ${state.timeLeft < 60 ? 'text-red-600' : 'text-gray-800'}`}>
            {formatTime(state.timeLeft)}
          </span>
        </div>

        {/* Question Box */}
        <div className="bg-white shadow-xl rounded-xl p-6 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Question {state.currentQuestion + 1} of {quizData.questions.length}
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
  isMCQ ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
}`}>
  {(currentQ?.questionType || "").toUpperCase()} • {currentQ?.marks ?? 0} marks
</span>

          </div>

          <p className="text-lg mb-4 whitespace-pre-wrap text-gray-700">
            {currentQ.question}
          </p>

          {/* Optional Image */}
          {currentQ.image && (
            <img
              src={currentQ.image}
              alt="Question visual"
              className="w-full max-h-64 object-contain rounded-lg mb-4 border-2 border-gray-200"
            />
          )}

          {/* Answer Section */}
         {/* Answer Section */}
{currentQ.questionType !== "descriptive" ? (
  // ✅ Any non-descriptive question gets MCQ options (single/multiple choice)
  <div className="space-y-3">
    {currentQ.answers.map((ans, i) => {
      // If multiple answers possible → store array instead of single string
      const userSelection = state.answers[state.currentQuestion];
      const selected = Array.isArray(userSelection)
        ? userSelection.includes(ans.text)
        : userSelection === ans.text;

      return (
        <button
          key={i}
          onClick={() => {
            const idx = state.currentQuestion;
            let newSelection;

            if (Array.isArray(userSelection)) {
              // Toggle checkbox style
              if (userSelection.includes(ans.text)) {
                newSelection = userSelection.filter(a => a !== ans.text);
              } else {
                newSelection = [...userSelection, ans.text];
              }
            } else {
              // Default: single choice
              newSelection = ans.text;
            }

            const answers = [...state.answers];
            answers[idx] = newSelection;
            const visited = [...state.visited];
            visited[idx] = true;
            setState(s => ({ ...s, answers, visited }));
          }}
          className={`w-full text-left px-4 py-3 rounded-lg border-2 text-base transition-all duration-200
            ${selected
              ? "bg-blue-100 border-blue-500 text-blue-800 font-semibold shadow-md"
              : "bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            }`}
        >
          <span className="flex items-center gap-3">
            <span
              className={`w-6 h-6 flex items-center justify-center rounded ${
                Array.isArray(userSelection) ? "border-2" : "rounded-full border-2"
              } ${
                selected ? "border-blue-500 bg-blue-500" : "border-gray-400"
              }`}
            >
              {selected && <span className="text-white text-xs">✓</span>}
            </span>
            {ans.text}
          </span>
        </button>
      );
    })}
  </div>
) : (
  // ✅ Descriptive question
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Write your answer below:
    </label>
    <textarea
      value={state.descriptiveAnswers[state.currentQuestion] || ""}
      onChange={(e) => handleDescriptiveAnswer(e.target.value)}
      placeholder="Type your answer here..."
      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition resize-none"
      rows={8}
    />
    <p className="text-sm text-gray-500 mt-2">
      This answer will be reviewed by your teacher
    </p>
  </div>
)}



          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between gap-4 flex-wrap">
            <Button
              onClick={() => goto(Math.max(state.currentQuestion - 1, 0))}
              disabled={state.currentQuestion === 0}
              className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700"
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (state.currentQuestion === quizData.questions.length - 1) {
                  if (confirm("Are you sure you want to submit the quiz?")) {
                    setState(s => ({ ...s, showResults: true }));
                  }
                } else {
                  goto(state.currentQuestion + 1);
                }
              }}
              className={`w-full sm:w-auto ${
                state.currentQuestion === quizData.questions.length - 1
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {state.currentQuestion === quizData.questions.length - 1 ? "Submit Quiz" : "Next"}
            </Button>
          </div>
        </div>
      </div>

      {/* Question Map Sidebar */}
      <div className="w-full lg:w-80 p-4 bg-white border-t lg:border-t-0 lg:border-l shadow-lg">
        <h4 className="font-semibold mb-4 text-center lg:text-left text-gray-800">
          Question Navigator
        </h4>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {quizData.questions.map((q, i) => {
            const isAnswered = q.questionType === 'mcq' 
              ? state.answers[i] != null 
              : state.descriptiveAnswers[i] != null;
            const isVisited = state.visited[i];
            const isCurrent = i === state.currentQuestion;
            
            let bgColor = "bg-gray-300";
            if (isAnswered) bgColor = "bg-green-500";
            else if (isVisited) bgColor = "bg-yellow-400";
            if (isCurrent) bgColor += " ring-4 ring-blue-400";

            return (
              <button
                key={i}
                onClick={() => goto(i)}
                className={`relative w-12 h-12 rounded-lg flex flex-col items-center justify-center text-white font-semibold hover:scale-105 transition transform ${bgColor}`}
                title={`Go to Q${i + 1}`}
              >
                <span className="text-sm">{i + 1}</span>
                <span className="text-xs">{q.questionType === 'mcq' ? 'M' : 'D'}</span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span>Not visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 ring-2 ring-blue-400 rounded"></div>
            <span>Current</span>
          </div>
          <div className="mt-4 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">M = MCQ, D = Descriptive</p>
          </div>
        </div>

        {/* Quiz Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-semibold text-gray-800 mb-2">Quiz Info</h5>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Total Questions: {quizData.questions.length}</p>
            <p>MCQ: {quizData.questions.filter(q => q.questionType === 'mcq').length}</p>
            <p>Descriptive: {quizData.questions.filter(q => q.questionType === 'descriptive').length}</p>
            <p>Negative Marking: {quizData.negativeMarking}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizApp() {
  return (
    <Suspense fallback={<div className="flex justify-center mt-20"><ClipLoader /></div>}>
      <QuizAppContent />
    </Suspense>
  );
}