// app/u/quizresults/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

interface IAnswer {
  questionId: string;
  questionIndex: number;
    questionTitle: string;
  userAnswer: string;
  correctAnswer: string;
}

interface QuizResult {
  _id: string;
  quizTitle: string;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  answers: IAnswer[];
  createdAt: string;
}

export default function UserQuizResultsPage() {
  const { data: session } = useSession();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    // if (!session?.user?.email) return;

    axios
      .get(`/api/u/quizresult`)
      .then((res) => setResults(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Quiz Attempts</h1>

      {results.length === 0 ? (
        <p>No quiz attempts found.</p>
      ) : (
        <div className="space-y-4">
          {results.map((r) => {
            const isOpen = openId === r._id;
            return (
              <div key={r._id} className="border rounded p-4 bg-white shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{r.quizTitle}</p>
                    <p className="text-sm text-gray-600">
                      Score: <strong>{r.score}</strong> | Correct:{" "}
                      {r.correctAnswers} | Incorrect: {r.incorrectAnswers}
                    </p>
                  </div>
                  <button
                    className="text-blue-600 underline"
                    onClick={() => setOpenId(isOpen ? null : r._id)}
                  >
                    {isOpen ? "Hide" : "Show"}
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-4 bg-gray-50 p-4 rounded">
                    <ul className="space-y-2 text-sm">
                      {r.answers.map((a, i) => (
                        <li key={i} className="border-b pb-2">
                          <p>
                            <strong>QID:</strong> {a.questionId}
                          </p>
                          <p>question: {a.questionTitle}</p>
                          <p>
                            Your Answer:{" "}
                            <span
                              className={
                                a.userAnswer === a.correctAnswer
                                  ? "text-green-600 font-medium"
                                  : "text-red-600 font-medium"
                              }
                            >
                              {a.userAnswer || "— skipped —"}
                            </span>
                          </p>
                          <p>
                            Correct Answer:{" "}
                            <span className="font-medium text-gray-800">
                              {a.correctAnswer}
                            </span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
