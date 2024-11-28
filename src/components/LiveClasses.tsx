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
      <h2 className="text-green-700 text-2xl font-bold mb-4 pl-5 pr-5">Live Classes</h2>
      {liveClasses.length > 0 ? (
        <div className="grid gap-6">
          {liveClasses.map((liveClass, index) => (
            <div
              key={index}
              className="bg-green-200 w-full h-64 flex justify-center items-center rounded-lg text-black mb-4"
            >
              <iframe
                src={liveClass.url}
                title={liveClass.title}
                className="w-full h-full rounded-lg"
                sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation"
                allowFullScreen
              />
              <p className="mt-2 text-lg text-black text-center">{liveClass.title}</p>
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
