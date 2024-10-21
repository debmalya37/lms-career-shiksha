export default function LiveClasses() {
    return (
      <div className="mt-8 p-4">
        <h2 className="text-green-700 text-2xl font-bold mb-4">Live Classes</h2>
        <div className="bg-red-200 w-full h-64 flex justify-center items-center rounded-lg">
          {/* Embed the currently running live class video */}
          <p className="text-lg">Live Class Video</p>
        </div>
        <p className="mt-2 text-lg">Title of the Video</p>
      </div>
    );
  }
  