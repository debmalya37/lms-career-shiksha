// app/course/[courseId]/[subjectId]/[topicId]/[tutorialId]/page.tsx
import DisableRightClickAndClipboard from '@/components/DisableRightClick';
import MobileClipboardFunction from "@/components/MobileClipboard";
import TutorialVideoPlayer from '@/components/TutorialVideoPlayer';
import connectMongo from '@/lib/db';
import Tutorial, { ITutorial } from '@/models/tutorialModel'; // Ensure ITutorial is imported

export const dynamic = 'force-dynamic';

// Helper function to convert a standard YouTube URL to a nocookie URL
function convertToNoCookieUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      urlObj.hostname = 'www.youtube-nocookie.com';
    }
    return urlObj.toString();
  } catch (error) {
    console.error('Invalid YouTube URL:', url);
    return url; // Fallback to the original URL if it's invalid
  }
}

// Function to fetch tutorial details by ID
async function fetchTutorialDetails(tutorialId: string): Promise<ITutorial | null> {
  await connectMongo();
  const tutorial = await Tutorial.findById(tutorialId)
    .select('title description url')
    .lean<ITutorial | null>(); // Specify the expected type

  return tutorial || null; // Return null if tutorial is not found
}


export default async function TutorialPage({ params }: { params: { tutorialId: string } }) {
  const tutorial = await fetchTutorialDetails(params.tutorialId);

  if (!tutorial) {
    return <p className="text-center text-gray-500 mt-20">Tutorial not found.</p>;
  }

    // Convert the tutorial URL to nocookie format
    const safeUrl = convertToNoCookieUrl(tutorial.url);
  return (
    <div className="container mx-auto p-3 bg-gradient-to-b from-gray-950 to-blue-950">
      <DisableRightClickAndClipboard/>
    <h1 className="text-3xl font-bold mb-4 text-white">{tutorial.title}</h1>
    <div className="max-w-4xl mx-auto">
      <TutorialVideoPlayer url={tutorial.url} />
      <p className="mt-4 text-gray-200">{tutorial.description}</p>
    </div>
  </div>
  );
}
