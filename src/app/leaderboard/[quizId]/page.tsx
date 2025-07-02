"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

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
  const { quizId } = useParams();
  const { data: session } = useSession();
  const [data,   setData]   = useState<QuizLeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [myuserName, setMyUserName] = useState<string>("");

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

  useEffect(() => {
      fetch("/api/profile")
        .then(r => r.json())
        .then(p => setMyUserName(p.name || p.email || "Anonymous"))
        .catch(() => {});
    }, []);

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

  // Find the current user's entry (match on name/email whichever you store)
  // const myName = session?.user?.name;

  const myEntry = data.entries.find((e) => e.userName === myuserName);

  // Prepare stats cards: top, average, your score
  const stats = [
    { label: "🏆 Top Score",    value: data.topScore.toFixed(2) },
    { label: "📊 Average Score",value: data.averageScore.toFixed(2) },
    {
      label: "🎯 Your Score",
      value: myEntry ? myEntry.score.toFixed(2) : "Not appeared",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-4 sm:p-6 lg:p-12">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-800">
          {data.quizTitle}
        </h1>
        <p className="text-indigo-600 mt-1">{data.courseTitle}</p>
      </header>

      {/* Stats Cards: 2 cols on mobile, 3 on sm+ */}
      {/* Stats Cards: 3 columns on all sizes, with even spacing */}
      <div className="grid grid-cols-3 gap-4 mb-8">
  {stats.map((stat) => (
    <div
      key={stat.label}
      className="
        p-4
        bg-white/60 backdrop-blur-md
        rounded-2xl shadow-lg
        flex flex-col justify-center items-center
        text-center
        hover:scale-[1.02] transition
      "
    >
      <span
        className="
          text-xs sm:text-xs md:text-base 
          font-medium text-indigo-700 
          mb-2 
          max-w-full 
          truncate
        "
      >
        {stat.label}
      </span>
      <span className="text-xl sm:text-2xl font-bold text-indigo-900">
        {stat.value}
      </span>
    </div>
  ))}
</div>



      {/* Leaderboard List */}
      <section className="space-y-4 overflow-hidden">
        {data.entries.map((e, i) => (
          <div
            key={e.userName}
            className={`
              flex flex-col sm:flex-row justify-between
              items-start sm:items-center
              p-4 rounded-xl shadow-md
              transition-transform hover:scale-[1.01]
              ${i === 0
                ? "bg-yellow-100/80"
                : i === 1
                ? "bg-gray-100/80"
                : i === 2
                ? "bg-orange-100/80"
                : "bg-white/70"
              }
            `}
          >
            {/* Rank + Name */}
            <div className="flex items-center space-x-3 mb-2 sm:mb-0 flex-shrink-0">
              <div className="text-xl font-semibold text-indigo-800 w-8 text-center">
                {i + 1}
              </div>
              <div className="text-lg font-medium text-gray-800 break-all">
                {e.userName}
                {e.userName === myuserName && (
                  <span className="ml-1 text-indigo-600">(You)</span>
                )}
              </div>
            </div>

            {/* Score */}
            <div className="text-right ml-auto">
              <span className="text-sm text-gray-600 block">Score</span>
              <span className="text-xl font-bold text-indigo-900">
                {e.score.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
