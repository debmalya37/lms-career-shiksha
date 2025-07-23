// app/course/[courseId]/[subjectId]/[topicId]/[tutorialId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeftIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import DisableRightClickAndClipboard from "@/components/DisableRightClick";
import MobileClipboardFunction from "@/components/MobileClipboard";
import TutorialVideoPlayer from "@/components/TutorialVideoPlayer";
import ProgressBar from "@/components/ProgressBar"; // optional, if you have a progress bar component

interface Tutorial {
  _id: string;
  title: string;
  description: string;
  url: string;
  createdAt: string;
}

export default function TutorialPage({
  params,
}: {
  params: {
    courseId: string;
    subjectId: string;
    topicId: string;
    tutorialId: string;
  };
}) {
  const { courseId, subjectId, topicId, tutorialId } = params;
  const router = useRouter();

  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [allInTopic, setAllInTopic] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch userId from profile endpoint
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setUserId(data.userId);
        }
      } catch (e) {
        console.error('Failed to fetch userId', e);
      }
    })();
  }, []);

  // Handler for when video playback ends
  const handleVideoEnd = async () => {
    if (completed || !userId) return;
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courseId, tutorialId }),
      });
      if (!res.ok) throw new Error('Failed to record progress');
      setCompleted(true);
    } catch (err) {
      console.error(err);
    }
  };

  // 1) Load current tutorial
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/tutorials/${tutorialId}`);
        if (!res.ok) throw new Error("Tutorial load failed");
        setTutorial(await res.json());
      } catch (e) {
        console.error(e);
      }
    })();
  }, [tutorialId]);

  // 2) Load entire topic's tutorials
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/tutorials?topic=${topicId}`);
        if (!res.ok) throw new Error("Topic tutorials load failed");
        const list: Tutorial[] = await res.json();
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setAllInTopic(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [topicId]);

  // 3) Dark mode init
  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  if (loading || !tutorial) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-gray-500">Loading…</span>
      </div>
    );
  }

  // Compute next tutorial
  const idx = allInTopic.findIndex((t) => t._id === tutorial._id);
  const nextTutorial = idx >= 0 && idx < allInTopic.length - 1 ? allInTopic[idx + 1] : null;

  return (
    <div
      className={`min-h-screen pb-16 ${ dark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900" }`}
    >
      <DisableRightClickAndClipboard />
      <MobileClipboardFunction />

      {/* Sticky Header */}
      <header className="sticky top-0 z-10 backdrop-blur bg-opacity-60 bg-white dark:bg-gray-800 dark:bg-opacity-60 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 py-3">
        <button onClick={() => router.back()} aria-label="Go back" className="p-1">
          <ChevronLeftIcon className="w-6 h-6 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 transition" />
        </button>
        <h1 className="text-lg font-semibold truncate">{tutorial.title}</h1>
        <button onClick={toggleDark} className="p-1" aria-label="Toggle theme">
          {dark ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-gray-600" />}
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-8">
        {/* Video */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
          <TutorialVideoPlayer url={tutorial.url} onEnded={handleVideoEnd} />
        </div>

        {/* Completion feedback */}
        {completed && (
          <div className="text-green-500 font-semibold">
            🎉 Tutorial marked as completed!
          </div>
        )}

        {/* Description */}
        <section className="prose dark:prose-dark max-w-none">
          <h2 className="text-2xl font-bold mb-4">About this Tutorial</h2>
          <p>{tutorial.description}</p>
        </section>

        {/* Optional progress bar at bottom of tutorial list */}
        {userId && (
          <ProgressBar courseId={courseId} userId={userId} />
        )}
      </main>

      {/* Next CTA on Mobile */}
      {nextTutorial && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white py-3 shadow-xl flex justify-center sm:hidden">
          <Link href={`/courses/${courseId}/${subjectId}/${topicId}/${nextTutorial._id}`} className="font-medium">
            Next Tutorial →
          </Link>
        </div>
      )}
    </div>
  );
}
