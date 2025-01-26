// app/course/[courseId]/[subjectId]/[topicId]/[tutorialId]/page.tsx
import DisableRightClickAndClipboard from '@/components/DisableRightClick';
import MobileClipboardFunction from "@/components/MobileClipboard";
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
    <div className="min-h-screen bg-yellow-50 flex flex-col">
      <DisableRightClickAndClipboard/>
      <MobileClipboardFunction/>
      <div className="container mx-auto px-4 py-12">
        
        {/* Video Section */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="w-full h-96 bg-gray-100 rounded-md overflow-hidden">
            <iframe
              title={tutorial.title}
              src={`${safeUrl}?controls=0&showinfo=0&mode=opaque&amp;rel=0&amp;autohide=1&amp;&amp;wmode=transparent`}
              className="w-full h-full"
              sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation"
              allowFullScreen
            />
          </div>
          <h2 className="text-3xl font-bold mt-6 text-blue-700">{tutorial.title}</h2>
          <p className="mt-4 text-lg text-gray-700">{tutorial.description}</p>
        </div>
      </div>
      
    </div>
  );
}
