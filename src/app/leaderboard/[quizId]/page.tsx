// app/leaderboard/[quizId]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Entry {
  userName: string;
  score: number;
}

interface QuizLeaderboardResponse {
  quizTitle:    string;
  courseTitle:  string;
  topScore:     number;
  averageScore: number;
  entries:      Entry[];
}

export default function QuizLeaderboardPage() {
  const { quizId } = useParams();                // <-- pull the dynamic segment
  const [data, setData] = useState<QuizLeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;
    setLoading(true);
    fetch(`/api/leaderboard/quiz/${quizId}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load leaderboard:", err);
        setLoading(false);
      });
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <svg className="animate-spin h-8 w-8 text-gray-500" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4" fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span className="ml-2 text-gray-500">Loading leaderboard…</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">No data available for this quiz.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">
        {data.quizTitle}{" "}
        <span className="text-gray-500 text-xl">({data.courseTitle})</span>
      </h1>

      <div className="flex justify-between bg-gray-100 p-4 rounded-lg">
        <div>
          <span className="block text-sm text-gray-600">Top Score</span>
          <span className="text-xl font-semibold">{data.topScore}</span>
        </div>
        <div>
          <span className="block text-sm text-gray-600">Average</span>
          <span className="text-xl font-semibold">
            {data.averageScore.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-indigo-50">
              <th className="px-4 py-2 text-left">Rank</th>
              <th className="px-4 py-2 text-left">Student</th>
              <th className="px-4 py-2 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.map((e, i) => (
              <tr
                key={e.userName}
                className={i % 2 === 0 ? "bg-white" : "bg-indigo-50"}
              >
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">{e.userName}</td>
                <td className="px-4 py-2 text-right">{e.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
