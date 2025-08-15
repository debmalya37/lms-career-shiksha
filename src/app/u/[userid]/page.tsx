// app/u/[userid]/page.tsx
import connectMongo from "@/lib/db";
import { User }        from "@/models/user";
import Profile         from "@/models/profileModel";
import Course          from "@/models/courseModel";
import QuizResult      from "@/models/quizResultModel";
import { Types }       from "mongoose";
import { notFound }    from "next/navigation";

type Props = {
  params: { userid: string };
};

export default async function UserDetailPage({ params }: Props) {
  await connectMongo();

  // 1) Load user
  const user = await User.findById(params.userid).lean();
  if (!user) notFound();

  // 2) Load profile (e.g. gender, dob, age)
  const profile = await Profile.findOne({ userId: user._id }).lean();
//   const gender = profile?.gender || "—";
//   let age = "—";
//   if (profile?.dob) {
//     const diffMs = Date.now() - new Date(profile.dob).getTime();
//     age = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25)).toString();
//   }

  // 3) Enrolled courses + expiry
  const courseIds = user.course || [];
  const courses = await Course.find({ _id: { $in: courseIds } })
    .lean<{ _id: Types.ObjectId; title: string; duration: number }[]>();
  const now = Date.now();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const enrolled = courses.map(c => {
    const rec = (user.purchaseHistory || []).find(
      p => p.course.toString() === c._id.toString()
    );
    const purchasedAt = rec?.purchasedAt || null;
    const expiryDate = purchasedAt
      ? new Date(purchasedAt.getTime() + c.duration * MS_PER_DAY)
      : null;
    const daysLeft = expiryDate
      ? Math.max(0, Math.ceil((expiryDate.getTime() - now) / MS_PER_DAY))
      : null;
    return {
      courseId:     c._id.toString(),
      title:        c.title,
      durationDays: c.duration,
      purchasedAt,
      expiryDate,
      daysLeft,
    };
  });

  // 4) Purchase history
  const purchaseHistory = (user.purchaseHistory || []).map((p, i) => ({
    key:            i,
    courseId:       p.course.toString(),
    amount:         p.amount,
    transactionId:  p.transactionId,
    purchasedAt:    p.purchasedAt,
    promoCode:      p.promoCode || "—",
  }));

  // 5) Quiz results
  const quizResults = await QuizResult.find({ userEmail: user.email })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">User Details</h1>

      {/* 1) Core User Fields */}
      <section className="bg-white shadow rounded p-4">
        <h2 className="font-semibold mb-2">Account Information</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt>Name:</dt>          <dd>{user.name}</dd>
          <dt>Email:</dt>         <dd>{user.email}</dd>
          {/* <dt>Password Hash:</dt> <dd className="font-mono text-xs">•••••••••••••••</dd> */}
          <dt>Session Token:</dt> <dd className="break-all">{user.sessionToken || "—"}</dd>
          <dt>Device ID:</dt>     <dd>{user.deviceIdentifier || "—"}</dd>
          <dt>Phone No:</dt>      <dd>{user.phoneNo || "—"}</dd>
          <dt>Address:</dt>       <dd>{user.address || "—"}</dd>
          {/* <dt>Reset OTP:</dt>     <dd>{user.resetOTP || "—"}</dd> */}
          {/* <dt>OTP Expires:</dt>   <dd>{user.resetOTPExpires?.toLocaleString() || "—"}</dd> */}
          <dt>Created At:</dt>    <dd>{user.createdAt.toLocaleString()}</dd>
          <dt>Updated At:</dt>    <dd>{(user as any).updatedAt?.toLocaleString() || "—"}</dd>
        </dl>
      </section>

      {/* 2) Profile */}
      {/* <section className="bg-white shadow rounded p-4">
        <h2 className="font-semibold mb-2">Profile</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt>First Name:</dt> <dd>{(profile as any)?.firstName || "—"}</dd>
          <dt>Last Name:</dt>  <dd>{(profile as any)?.lastName  || "—"}</dd>
          
          <dt>Aim:</dt>        <dd>{(profile as any)?.aim || "—"}</dd>
          <dt>Subject:</dt>    <dd>{(profile as any)?.subject || "—"}</dd>
        </dl>
      </section> */}

      {/* 3) Enrolled Courses */}
      <section className="bg-white shadow rounded p-4">
        <h2 className="font-semibold mb-2">Enrolled Courses</h2>
        {enrolled.length === 0 ? (
          <p>No courses enrolled.</p>
        ) : (
          <ul className="space-y-3">
            {enrolled.map(c => (
              <li key={c.courseId} className="border-b pb-2 text-sm">
                <p><strong>{c.title}</strong></p>
                <p>
                  Duration: {c.durationDays} days&nbsp;|&nbsp;
                  Purchased: {c.purchasedAt?.toLocaleDateString() || "—"}
                </p>
                <p>
                  Expires: {c.expiryDate?.toLocaleDateString() || "—"}{" "}
                  {c.daysLeft != null && `(${c.daysLeft} days left)`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 4) Purchase History */}
      <section className="bg-white shadow rounded p-4">
        <h2 className="font-semibold mb-2">Purchase History</h2>
        {purchaseHistory.length === 0 ? (
          <p>No purchases yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {purchaseHistory.map(p => (
              <li key={p.key} className="flex justify-between">
                <span>
                  [{p.courseId}] {p.transactionId} –{" "}
                  {p.purchasedAt.toLocaleDateString()}
                </span>
                <span>₹{(p.amount / 100).toFixed(2)} &nbsp;|&nbsp; Promo: {p.promoCode}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 5) Quiz Results */}
      <section className="bg-white shadow rounded p-4">
        <h2 className="font-semibold mb-2">Quizzes Taken</h2>
        {quizResults.length === 0 ? (
          <p>No quiz results yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {quizResults.map((q, i) => (
              <li key={i} className="border-b pb-2">
                <p><strong>{q.quizTitle}</strong></p>
                <p>
                  Score: {q.score} &bull; Correct: {q.correctAnswers} &bull;{" "}
                  Incorrect: {q.incorrectAnswers}
                </p>
                <p className="text-gray-500 text-xs">
                  Taken: {new Date(q.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
