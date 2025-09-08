// ===================================================================
// File: app/mainsset/page.tsx
// User UI to list available mains sets (for courses user owns) and submit
// Expects APIs:
// GET  /api/mainsset/user                 => mains sets available to current user
// POST /api/mainsset/submit/[mainsSetId]  => accepts FormData with files & metadata
// ===================================================================

"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Question { questionText: string; maxMarks: number }
interface MainsSetBrief { _id: string; title: string; description?: string; course: { _id: string; title: string }; questions: Question[] }

export default function UserMainsSetPage() {
  const [sets, setSets] = useState<MainsSetBrief[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFiles, setCurrentFiles] = useState<Record<string, File[]>>({}); // mainsSetId -> files per question
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  useEffect(() => { fetchSets(); }, []);

  async function fetchSets() {
    try {
      setLoading(true);
      const res = await fetch('/api/mainsset/user');
      const data = await res.json();
      setSets(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function handleFileSelect(mainsId: string, qIndex: number, file: File | null) {
    setCurrentFiles(prev => {
      const arr = prev[mainsId] ? [...prev[mainsId]] : [];
      arr[qIndex] = file as any;
      return { ...prev, [mainsId]: arr };
    });
  }

  async function submitAnswers(mainsId: string) {
    const files = currentFiles[mainsId] || [];
    if (files.length === 0) return alert('Attach at least one file');

    try {
      setSubmitting(prev => ({ ...prev, [mainsId]: true }));
      const fd = new FormData();
      files.forEach((f, idx) => {
        if (f) fd.append(`file_${idx}`, f as File);
      });
      // optional metadata
      fd.append('meta', JSON.stringify({ submittedAt: new Date().toISOString() }));

      const res = await fetch(`/api/mainsset/submit/${mainsId}`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      alert('Submitted successfully');
      // clear files for that set
      setCurrentFiles(prev => ({ ...prev, [mainsId]: [] }));
    } catch (err) {
      console.error(err);
      alert('Could not submit answers');
    } finally {
      setSubmitting(prev => ({ ...prev, [mainsId]: false }));
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mains Sets — Submit Answers</h1>
      {loading && <p className="text-sm text-gray-500">Loading sets...</p>}

      <div className="grid gap-4">
        {sets.length === 0 && !loading && <p className="text-gray-500">No mains sets available for your courses.</p>}

        {sets.map((s) => (
          <Card key={s._id}>
            <CardHeader className="flex justify-between items-center">
              <div>
                <div className="font-medium">{s.title}</div>
                <div className="text-sm text-gray-500">{s.course.title}</div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              {s.description && <p className="text-sm text-gray-700">{s.description}</p>}

              <div className="grid gap-2">
                {s.questions.map((q, i) => (
                  <div key={i} className="p-3 border rounded grid gap-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">Q{i+1}. {q.questionText}</div>
                      <div className="text-sm text-gray-500">Max: {q.maxMarks}</div>
                    </div>

                    <input
                    title="Attach your answer file (PDF/Image)"
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => handleFileSelect(s._id, i, e.target.files?.[0] ?? null)}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => submitAnswers(s._id)} disabled={!!submitting[s._id]}>
                  {submitting[s._id] ? 'Submitting...' : 'Submit Answers'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


