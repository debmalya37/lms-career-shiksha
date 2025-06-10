// app/leaderboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Medal, Crown } from "lucide-react";
import Link from "next/link";

type LeaderboardEntry = {
  userEmail:     string;
  userName:      string;
  averageScore:  number;
  quizCount:     number;
};

type QuizOption = {
  _id:          string;
  title:        string;
  courseTitle:  string;
};

export default function LeaderboardPage() {
  const [entries, setEntries]         = useState<LeaderboardEntry[]>([]);
  const [quizzes, setQuizzes]         = useState<QuizOption[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [myEmail, setMyEmail]         = useState<string>("");

  // 1) load overall leaderboard
  useEffect(() => {
    fetch("/api/leaderboard/all")
      .then(r => r.json())
      .then((data: LeaderboardEntry[]) => setEntries(data))
      .catch(console.error);
  }, []);

  // 2) load quiz list for jump-to
  useEffect(() => {
    fetch("/api/quiz")
      .then(r => r.json())
      .then((qs: any[]) =>
        setQuizzes(qs.map(q => ({
          _id:         q._id,
          title:       q.title,
          courseTitle: q.course.title || "",
        })))
      )
      .catch(console.error);
  }, []);

  // 3) load my email to find "my rank"
  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(p => setMyEmail(p.email))
      .catch(() => {});
  }, []);

  // sort descending by averageScore
  const sorted = [...entries].sort((a, b) => b.averageScore - a.averageScore);
  const totalCount = sorted.length;

  // top 3 slice
  const top3 = sorted.slice(0, 3);

  // find my index (0-based)
  const myIndex = sorted.findIndex(e => e.userEmail === myEmail);
  const myEntry = myIndex >= 0 ? sorted[myIndex] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header & Quiz jump */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-md">
            🌟 Quiz Leaderboard
          </h1>
          <p className="text-lg text-indigo-200">
            {totalCount} candidate{totalCount === 1 ? "" : "s"} have appeared.
          </p>
          <div className="mt-4 inline-flex items-center space-x-2">
            <select
              title="Select a quiz to view its leaderboard"
              className="px-4 py-2 rounded-md bg-white bg-opacity-80 text-gray-900"
              value={selectedQuiz}
              onChange={e => setSelectedQuiz(e.target.value)}
            >
              <option value="">— Jump to Quiz —</option>
              {quizzes.map(q => (
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

        {/* Top 3 */}
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
                {top3.map((entry, i) => (
                  <tr key={entry.userEmail} className="bg-white/10">
                    <td className="px-4 py-3 text-center text-white">
                      {i === 0 ? (
                        <Crown className="inline-block w-5 h-5 text-yellow-400 animate-pulse" />
                      ) : (
                        <Medal className="inline-block w-5 h-5 text-gray-300" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                    {entry.userName}
               {entry.userEmail === myEmail && (
                <span className="ml-1 text-sm text-indigo-200">(You)</span>
              )}
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

        {/* Spacer */}
        <div className="text-center text-indigo-200">…</div>

        {/* My Rank (if not already in top-3) */}
        {myEntry && myIndex >= 3 && (
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
                  <tr className="bg-indigo-700/50">
                    <td className="px-4 py-3 text-center text-white">
                      {myIndex + 1}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      {myEntry.userName} (You)
                    </td>
                    <td className="px-4 py-3 text-white text-center">
                      {myEntry.averageScore.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-white text-center">
                      {myEntry.quizCount}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

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
