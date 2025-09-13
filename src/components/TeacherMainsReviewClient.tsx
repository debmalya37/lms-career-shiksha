"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SubmissionAnswer { questionId: number; answerFile: string; marks?: number }
interface SubmissionItem { user: { _id: string; name?: string; email?: string }; answers: SubmissionAnswer[]; status: string; totalMarks?: number; }
interface MainsWithSubs { _id: string; title: string; course: { title: string }; submissions: SubmissionItem[] }

export default function TeacherMainsReviewClient({ initialSets }: { initialSets: MainsWithSubs[] }) {
  const [sets, setSets] = useState<MainsWithSubs[]>(initialSets);
  const [marksMap, setMarksMap] = useState<Record<string, Record<number, number>>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  function keyFor(mainsId: string, userId: string) {
    return `${mainsId}_${userId}`;
  }

  function setMark(mainsId: string, userId: string, qIdx: number, value: number) {
    const key = keyFor(mainsId, userId);
    setMarksMap(prev => ({ ...prev, [key]: { ...(prev[key] || {}), [qIdx]: value } }));
  }

  async function submitReview(mainsId: string, userId: string) {
    const key = keyFor(mainsId, userId);
    const marksObj = marksMap[key] || {};
    try {
      setSaving(prev => ({ ...prev, [key]: true }));
      const res = await fetch(`/api/teacher/mainsset/review/${mainsId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, marks: marksObj }),
      });
      if (!res.ok) throw new Error("Save failed");
      alert("Reviewed and saved");

      // refresh sets after save
      const updated = await fetch("/api/teacher/mainsset", { cache: "no-store" }).then(r => r.json());
      setSets(updated);
    } catch (err) {
      console.error(err);
      alert("Could not save review");
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  }

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Teacher — Mains Submissions Review</h1>

      <div className="grid gap-4">
        {sets.map((s) => (
          <Card key={s._id}>
            <CardHeader className="flex justify-between items-center">
              <div>
                <div className="font-medium">{s.title}</div>
                <div className="text-sm text-gray-500">{s.course.title}</div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              {s.submissions.length === 0 && (
                <p className="text-sm text-gray-500">No submissions yet.</p>
              )}

              {s.submissions.map((sub) => (
                <div key={sub.user._id} className="p-3 border rounded">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium">
                        {sub.user.name || sub.user.email || sub.user._id}
                      </div>
                      <div className="text-sm text-gray-500">Status: {sub.status}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        Total: {sub.totalMarks ?? "-"}{" "}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {sub.answers.map((ans, i) => (
                      <div
                        key={i}
                        className="grid sm:grid-cols-3 gap-2 items-center p-2 border rounded"
                      >
                        <div className="sm:col-span-2">
                          <div className="font-medium">Q{ans.questionId + 1}</div>
                          <a
                            href={ans.answerFile}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600 underline"
                          >
                            Open answer
                          </a>
                        </div>
                        <div className="sm:col-span-1">
                          <Input
                            type="number"
                            placeholder="Marks"
                            value={
                              (marksMap[`${s._id}_${sub.user._id}`]?.[ans.questionId] ??
                                ans.marks ??
                                "") as any
                            }
                            onChange={(e) =>
                              setMark(s._id, sub.user._id, ans.questionId, Number(e.target.value))
                            }
                          />
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end">
                      <Button
                        onClick={() => submitReview(s._id, sub.user._id)}
                        disabled={!!saving[`${s._id}_${sub.user._id}`]}
                      >
                        {saving[`${s._id}_${sub.user._id}`] ? "Saving..." : "Save Review"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
