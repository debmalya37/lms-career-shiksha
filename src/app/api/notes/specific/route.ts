import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Note from '@/models/noteModel';
import Subject, { ISubject } from '@/models/subjectModel';
import Topic, { ITopic } from '@/models/topicModel';
import { Types } from 'mongoose';



export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const subjectIds = searchParams.get("subject")?.split(",");
  
    try {
      await connectMongo();
  
      const query: any = {};
      if (subjectIds) {
        query.subject = { $in: subjectIds }; // Match any of the subjectIds
      }
  
      const notes = await Note.find(query).lean();
  
      // Fetch related subjects and topics for enrichment
      const subjectIdsToFetch = notes.map((note) => note.subject as Types.ObjectId);
      const topicIdsToFetch = notes.map((note) => note.topic as Types.ObjectId);
  
      const subjects = await Subject.find({ _id: { $in: subjectIdsToFetch } }).lean<ISubject[]>();
      const topics = await Topic.find({ _id: { $in: topicIdsToFetch } }).lean<ITopic[]>();
  
      // Step 5: Map subjects and topics by their IDs for quick lookup
    const subjectMap = subjects.reduce((acc, subject) => {
        acc[(subject._id as Types.ObjectId).toString()] = subject;
        return acc;
      }, {} as Record<string, ISubject>);
  
      const topicMap = topics.reduce((acc, topic) => {
        acc[(topic._id as Types.ObjectId).toString()] = topic;
        return acc;
      }, {} as Record<string, ITopic>);
  
      const enrichedNotes = notes.map((note) => ({
        ...note,
        subject: subjectMap[note.subject?.toString()] || null,
        topic: topicMap[note.topic?.toString()] || null,
      }));
  
      return NextResponse.json(enrichedNotes);
    } catch (error) {
      console.error("GET /api/notes Error:", error);
      return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
    }
  }
  