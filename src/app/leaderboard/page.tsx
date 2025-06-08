// app/leaderboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Medal, Crown } from "lucide-react";
import Link from "next/link";

type LeaderboardEntry = {
  userName: string;
  averageScore: number;
  quizCount: number;
};

type QuizOption = {
  _id: string;
  title: string;
  courseTitle: string;
};

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [quizzes, setQuizzes] = useState<QuizOption[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");

  // fetch overall leaderboard
  useEffect(() => {
    fetch("/api/leaderboard/all")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // fetch quiz list for selector
  useEffect(() => {
    fetch("/api/quiz")
      .then((r) => r.json())
      .then((qs: any[]) =>
        setQuizzes(
          qs.map((q) => ({
            _id: q._id,
            title: q.title,
            courseTitle: q.course.title || "",
          }))
        )
      )
      .catch(console.error);
  }, []);

  const sorted = [...data].sort((a, b) => b.averageScore - a.averageScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-md">
            🌟 Quiz Leaderboard
          </h1>
          <p className="text-lg text-indigo-200">
            See the top performers and compare your progress!
          </p>
          {/* Quiz selector */}
          <div className="mt-4 inline-flex items-center space-x-2">
            <select
            title="Select a quiz to view its leaderboard"
              className="px-4 py-2 rounded-md bg-white bg-opacity-80 text-gray-900"
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
            >
              <option value="">— Jump to Quiz —</option>
              {quizzes.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.title} ({q.courseTitle})
                </option>
              ))}
            </select>
            {selectedQuiz && (
              <Link
                href={`/leaderboard/${selectedQuiz}`}
                className="px-4 py-2 bg-teal-400 hover:bg-teal-500 text-black font-semibold rounded-md shadow transition"
              >
                Go
              </Link>
            )}
          </div>
        </div>

        {/* Overall Leaderboard Table */}
        <div className="bg-white/20 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-white/30">
                <tr>
                  <Th>#</Th>
                  <Th>Student</Th>
                  <Th numeric>Avg Score</Th>
                  <Th numeric>Total Quizzes</Th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((entry, i) => (
                  <tr
                    key={entry.userName}
                    className={`transition-colors hover:bg-white/10 ${
                      i % 2 === 0 ? "bg-white/10" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-center text-white">
                      {i === 0 ? (
                        <Crown className="inline-block w-5 h-5 text-yellow-400 animate-pulse" />
                      ) : i === 1 ? (
                        <Medal className="inline-block w-5 h-5 text-gray-300" />
                      ) : i === 2 ? (
                        <Medal className="inline-block w-5 h-5 text-yellow-700" />
                      ) : (
                        i + 1
                      )}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      {entry.userName}
                    </td>
                    <td className="px-4 py-3 text-white text-center">
                      {entry.averageScore.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-white text-center">
                      {entry.quizCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
  numeric = false,
}: {
  children: React.ReactNode;
  numeric?: boolean;
}) {
  return (
    <th
      className={`px-4 py-3 text-sm font-semibold text-indigo-100 uppercase tracking-wide ${
        numeric ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}
