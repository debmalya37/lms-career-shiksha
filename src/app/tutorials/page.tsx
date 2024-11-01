// app/tutorials/page.tsx
import connectMongo from '@/lib/db';
import Tutorial from '@/models/tutorialModel';

export const dynamic = 'force-dynamic'; // Enable dynamic rendering if needed

async function fetchTutorials() {
  await connectMongo();
  const tutorials = await Tutorial.find({}).lean();
  return tutorials;
}

export default async function TutorialsPage() {
  const tutorials = await fetchTutorials();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tutorials</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((video: any) => (
          <div key={video._id} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold mb-4">{video.title}</h3>
            <iframe
              title={video.title}
              className="w-full h-48"
              src={video.url}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <p className="text-gray-600">{video.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
