// app/course/[courseId]/[subjectId]/[topicId]/[tutorialId]/page.tsx
import connectMongo from '@/lib/db';
import Tutorial, { ITutorial } from '@/models/tutorialModel'; // Ensure ITutorial is imported

export const dynamic = 'force-dynamic';

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

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col">
      <div className="container mx-auto px-4 py-12">
        
        {/* Video Section */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="w-full h-96 bg-gray-100 rounded-md overflow-hidden">
            <iframe
              title={tutorial.title}
              src={`${tutorial.url}?controls=0&showinfo=0&mode=opaque&amp;rel=0&amp;autohide=1&amp;&amp;wmode=transparent`}
              className="w-full h-full"
              sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation"
              allowFullScreen
            />
          </div>
          <h2 className="text-3xl font-bold mt-6 text-blue-700">{tutorial.title}</h2>
          <p className="mt-4 text-lg text-gray-700">{tutorial.description}</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-600 text-white text-center p-4">
        <p className="font-semibold">© 2024 Civil Academy</p>
      </footer>
    </div>
  );
}
