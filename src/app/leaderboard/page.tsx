"use client";
import { useEffect, useState } from "react";

type LeaderboardEntry = {
  userName: string;
  averageScore: number;
  quizCount: number;
};

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/leaderboard/all");
      const leaderboard = await res.json();
      setData(leaderboard);
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Position</th>
            <th className="p-2">Student Name</th>
            <th className="p-2">Avg. Score</th>
            <th className="p-2">Total Quizzes</th>
          </tr>
        </thead>
        <tbody>
          {data
            .sort((a, b) => b.averageScore - a.averageScore)
            .map((entry, index) => (
              <tr key={entry.userName} className="border-t">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{entry.userName}</td>
                <td className="p-2">{entry.averageScore.toFixed(2)}</td>
                <td className="p-2">{entry.quizCount}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
