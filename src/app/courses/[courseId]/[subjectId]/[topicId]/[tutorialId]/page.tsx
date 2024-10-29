// app/course/[courseId]/[subjectId]/[topicId]/[tutorialId]/page.tsx
import connectMongo from '@/lib/db';
import Tutorial from '@/models/tutorialModel';

export const dynamic = 'force-dynamic';

async function fetchTutorialDetails(tutorialId: string) {
  await connectMongo();
  const tutorial = await Tutorial.findById(tutorialId).select('title description url').lean();
  return tutorial;
}

export default async function TutorialPage({ params }: { params: { tutorialId: string } }) {
  const tutorial = await fetchTutorialDetails(params.tutorialId);

  if (!tutorial) {
    return <p>Tutorial not found.</p>;
  }

  return (
    <div className="min-h-screen bg-yellow-100">
      <div className="container mx-auto">
        
        {/* Video Section */}
        <div className="mt-8 max-w-4xl mx-auto text-black">
          <div className="bg-red-200 w-full h-96 rounded-md text-black">
            <iframe
              title={tutorial.title}
              src={tutorial.url}
              className="w-full h-full rounded-md"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <h2 className="text-2xl font-bold mt-4">{tutorial.title}</h2>
          <p className="mt-4 text-lg">{tutorial.description}</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-700 text-white text-center p-4 mt-8">
        Copyright Civil Academy 2024
      </footer>
    </div>
  );
}
