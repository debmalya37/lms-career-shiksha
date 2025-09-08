// app/admin/mainsset/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, Edit3, ChevronDown, ChevronUp } from "lucide-react";

interface CourseItem { _id: string; title: string; mainsAvailable?: boolean }
interface QuestionItem { questionText: string; maxMarks: number }
interface MainsSummary {
  _id: string;
  title: string;
  description?: string;
  course: { _id: string; title: string; mainsAvailable?: boolean };
  questions: QuestionItem[];
  submissionsCount?: number;
}

export default function AdminMainsSetPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [sets, setSets] = useState<MainsSummary[]>([]);
  const [loading, setLoading] = useState(false);

  // create / edit form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([{ questionText: "", maxMarks: 10 }]);

  // UI state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      // courses (for toggle & select)
      const [cRes, sRes] = await Promise.all([fetch("/api/course"), fetch("/api/admin/mainsset")]);
      const [cData, sData] = await Promise.all([cRes.json(), sRes.json()]);
      setCourses(Array.isArray(cData) ? cData : []);
      // normalize mains sets to expected shape
      const setsArr: MainsSummary[] = (Array.isArray(sData) ? sData : []).map((s: any) => ({
        _id: s._id?.toString?.() ?? s._id,
        title: s.title,
        description: s.description,
        course: s.course ? { _id: s.course._id?.toString?.() ?? s.course._id, title: s.course.title, mainsAvailable: s.course.mainsAvailable } : { _id: "", title: "" },
        questions: Array.isArray(s.questions) ? s.questions.map((q: any) => ({ questionText: q.questionText, maxMarks: q.maxMarks })) : [],
        submissionsCount: Array.isArray(s.submissions) ? s.submissions.length : 0,
      }));
      setSets(setsArr);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleMains(courseId: string, value: boolean) {
    try {
      await fetch("/api/course", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, mainsAvailable: value }),
      });
      setCourses((s) => s.map(c => c._id === courseId ? { ...c, mainsAvailable: value } : c));
      // refresh sets (some sets may become available/unavailable)
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert("Could not update course flag");
    }
  }

  function addQuestion() {
    setQuestions((q) => [...q, { questionText: "", maxMarks: 10 }]);
  }
  function removeQuestion(i: number) {
    setQuestions((q) => q.filter((_, idx) => idx !== i));
  }

  // populate form for edit
  function startEdit(setId: string) {
    const s = sets.find((x) => x._id === setId);
    if (!s) return;
    setEditingId(setId);
    setTitle(s.title || "");
    setDescription(s.description || "");
    setSelectedCourse(s.course?._id ?? null);
    setQuestions(s.questions.length ? s.questions.map(q => ({ ...q })) : [{ questionText: "", maxMarks: 10 }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setSelectedCourse(null);
    setQuestions([{ questionText: "", maxMarks: 10 }]);
  }

  async function createOrUpdateMainsSet() {
    if (!selectedCourse) return alert("Select a course");
    if (!title.trim()) return alert("Provide title");
    if (questions.length === 0) return alert("Add at least one question");

    try {
      setLoading(true);
      const payload = {
        course: selectedCourse,
        title,
        description,
        questions: questions.map((qq) => ({ questionText: qq.questionText, maxMarks: Number(qq.maxMarks) })),
      };

      if (editingId) {
        // Update existing mains set
        const res = await fetch(`/api/admin/mainsset/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update mains set");
        alert("Mains set updated");
      } else {
        // Create new
        const res = await fetch("/api/admin/mainsset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create mains set");
        alert("Mains set created");
      }

      // reset form and refresh lists
      cancelEdit();
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert("Could not save mains set");
    } finally {
      setLoading(false);
    }
  }

  // compute total marks from question list
  function totalMaxMarks(qs: QuestionItem[]) {
    return qs.reduce((s, q) => s + (Number(q.maxMarks) || 0), 0);
  }

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin — Mains Sets</h1>

      {/* Create / Edit card */}
      <Card>
        <CardHeader className="font-semibold">{editingId ? "Edit Mains Set" : "Create Mains Set"}</CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <select
              title="Select Course"
              value={selectedCourse ?? ""}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Select Course</option>
              {courses.filter(c => c.mainsAvailable).map(c => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <Textarea placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Questions</h3>
              <Button onClick={addQuestion} size="sm"><Plus className="w-4 h-4" /> Add</Button>
            </div>

            <div className="grid gap-2">
              {questions.map((q, i) => (
                <div key={i} className="p-3 border rounded grid sm:grid-cols-8 gap-2 items-center">
                  <div className="sm:col-span-6">
                    <Input placeholder={`Question ${i + 1}`} value={q.questionText} onChange={(e) => {
                      const t = e.target.value; setQuestions(prev => prev.map((p, idx) => idx === i ? { ...p, questionText: t } : p));
                    }} />
                  </div>
                  <div className="sm:col-span-1">
                    <Input type="number" min={1} placeholder="Max" value={q.maxMarks} onChange={(e) => {
                      const v = Number(e.target.value || 0); setQuestions(prev => prev.map((p, idx) => idx === i ? { ...p, maxMarks: v } : p));
                    }} />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <Button variant="destructive" onClick={() => removeQuestion(i)}><Trash className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-600">Total Marks: <strong>{totalMaxMarks(questions)}</strong></div>
          </div>

          <div className="flex justify-end gap-2">
            {editingId && <Button variant="outline" onClick={cancelEdit}>Cancel</Button>}
            <Button onClick={createOrUpdateMainsSet} disabled={loading}>{loading ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Mains Set')}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses list / toggle */}
      <Card>
        <CardHeader className="font-semibold">Courses & Mains Toggle</CardHeader>
        <CardContent className="grid gap-3">
          {loading && <p className="text-sm text-gray-500">Loading...</p>}
          <div className="grid gap-2">
            {courses.map((c) => (
              <div key={c._id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-sm text-gray-500">mainsAvailable: {c.mainsAvailable ? 'Yes' : 'No'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!!c.mainsAvailable}
                      onChange={(e) => toggleMains(c._id, e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm">Enable</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Existing mains sets */}
      <div className="grid gap-4">
        Existing mains sets
        {sets.length === 0 && !loading && <p className="text-gray-500">No mains sets created yet.</p>}

        {sets.map((s) => (
          <Card key={s._id}>
            <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="font-medium">{s.title}</div>
                <div className="text-sm text-gray-500">{s.course?.title}</div>
                <div className="ml-2 text-sm text-gray-700">Total Marks: <strong>{totalMaxMarks(s.questions)}</strong></div>
                <div className="ml-2 text-sm text-gray-500">Submissions: {s.submissionsCount ?? 0}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center gap-2 px-3 py-1 rounded border"
                  onClick={() => setExpanded(prev => ({ ...prev, [s._id]: !prev[s._id] }))}
                >
                  {expanded[s._id] ? <><ChevronUp className="w-4 h-4"/> Hide</> : <><ChevronDown className="w-4 h-4"/> Details</>}
                </button>

                <Button onClick={() => startEdit(s._id)} variant="outline" size="sm">
                  <Edit3 className="w-4 h-4" /> Edit
                </Button>
              </div>
            </CardHeader>

            {expanded[s._id] && (
              <CardContent className="grid gap-3">
                {s.description && <p className="text-sm text-gray-700">{s.description}</p>}

                <div className="grid gap-2">
                  {s.questions.map((q, i) => (
                    <div key={i} className="p-3 border rounded flex items-center justify-between">
                      <div>
                        <div className="font-medium">Q{i + 1}. {q.questionText}</div>
                        <div className="text-sm text-gray-500">Max Marks: {q.maxMarks}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
