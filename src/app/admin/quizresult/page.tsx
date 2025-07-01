"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
  userName: string;
  userEmail: string;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  answers: IAnswer[];
  createdAt: string;
}

export default function AdminQuizResultsPage() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [openId, setOpenId] = useState<string|null>(null);

  useEffect(() => {
    axios.get<QuizResult[]>('/api/quizresult')
      .then(res => setResults(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Quiz Attempts</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-100">
            <tr>
              {['Email','Name','Quiz','Score','Details'].map(h=>(
                <th key={h} className="px-4 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map(r => {
              const isOpen = openId === r._id;
              return (
                <React.Fragment key={r._id}>
                  <tr className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{r.userEmail}</td>
                    <td className="px-4 py-2">{r.userName}</td>
                    <td className="px-4 py-2">{r.quizTitle}</td>
                    <td className="px-4 py-2">{r.score}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={()=>setOpenId(isOpen?null:r._id)}
                        className="text-indigo-600 hover:underline"
                      >
                        {isOpen?'Hide':'Show'}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50 p-4">
                        <div className="mb-2">
                          <strong>Correct:</strong> {r.correctAnswers} &nbsp;
                          <strong>Incorrect:</strong> {r.incorrectAnswers}
                        </div>
                        <div>
                          <strong>Answer Sheet:</strong>
                          <ul className="list-disc ml-6 mt-2 space-y-1">
                            {r.answers.map((a, i) => (
                              <li key={i}>
                                QID:({a.questionIndex})<em>{a.questionId}</em> Q: {a.questionTitle} — Your: <strong>{a.userAnswer}</strong>; Correct: <strong>{a.correctAnswer}</strong>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
