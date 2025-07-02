// app/api/quiz/route.ts
import { NextRequest, NextResponse } from 'next/server'
import connectMongo from '@/lib/db'
import Quiz from '@/models/quizModel'
import { User } from '@/models/user'

export async function GET(request: NextRequest) {
  await connectMongo()

  // 1) find the current user by sessionToken cookie
  const sessionToken = request.cookies.get('sessionToken')?.value
  let userCourseIds: string[] = []

  if (sessionToken) {
    const user = await User.findOne({ sessionToken }).lean()
    if (user && Array.isArray(user.course)) {
      userCourseIds = user.course.map(c => c.toString())
    }
  }

  // 2) parse any explicit filters from query
  const url = new URL(request.url)
  const quizId    = url.searchParams.get('quizId')
  const subjectIds = url.searchParams.getAll('subjectId')   // e.g. ?subjectId=...
  // note: we no longer accept arbitrary courseId from client

  const filter: any = {}
  if (quizId)        filter._id     = quizId
  if (subjectIds.length) filter.subject = { $in: subjectIds }

  // 3) force filter by only the courses the user is enrolled in
  if (userCourseIds.length) {
    filter.course = { $in: userCourseIds }
  } else {
    // if user not found or has no courses, return nothing
    return NextResponse.json([], { status: 200 })
  }

  // 4) perform find
  try {
    const result = quizId
      ? await Quiz.findOne(filter).lean()
      : await Quiz.find(filter).lean()
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('quiz GET error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
