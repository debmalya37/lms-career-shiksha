interface LiveClass {
  title: string;
  url: string;
}

interface LiveClassesProps {
  liveClasses: LiveClass[]; // Accept an array of live classes
}

export default function LiveClasses({ liveClasses }: LiveClassesProps) {
  return (
    <div className="mt-8 p-4 ml-0">
      <h2 className="text-green-700 text-2xl font-bold mb-4 pl-5 pr-5 m-2">Live Classes</h2>
      {liveClasses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveClasses.map((liveClass, index) => (
            <div
              key={index}
              className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-md"
            >
              <div className="w-full h-48"> {/* Maintains 16:9 aspect ratio */}
                <iframe
                  src={liveClass.url}
                  title={liveClass.title}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <p className="text-lg font-semibold text-gray-800 truncate">{liveClass.title}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-green-200 w-full h-64 flex justify-center items-center rounded-lg text-black">
          <p className="text-lg">No live classes currently running</p>
        </div>
      )}
    </div>
  );
}
