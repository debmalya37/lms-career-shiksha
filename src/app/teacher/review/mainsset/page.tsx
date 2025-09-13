// ===================================================================
// File: app/teacher/review/mainsset/page.tsx
// Teacher UI to review submissions, give marks per question and mark reviewed
// ===================================================================

import TeacherMainsReviewClient from "@/components/TeacherMainsReviewClient";

export const dynamic = "force-dynamic"; // ✅ works here now (server component)

export default async function TeacherMainsReviewPage() {
  const res = await fetch(`https://civilacademyapp.com/api/teacher/mainsset`, {
    cache: "no-store", // ensures fresh data
  });

  if (!res.ok) {
    throw new Error("Failed to load teacher mains sets");
  }

  const sets = await res.json();

  return <TeacherMainsReviewClient initialSets={sets} />;
}
