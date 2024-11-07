interface LiveClassesProps {
  liveClass: {
    title: string;
    url: string;
  } | null;
}

export default function LiveClasses({ liveClass }: LiveClassesProps) {
  return (
    <div className="mt-8 p-4 ml-0">
      <h2 className="text-green-700 text-2xl font-bold mb-4 pl-5 pr-5">Live Classes</h2>
      <div className="bg-green-200 w-full h-64 flex justify-center items-center rounded-lg text-black">
        {liveClass ? (
          <iframe
            src={liveClass.url}
            title={liveClass.title}
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <p className="text-lg">No live class currently running</p>
        )}
      </div>
      {liveClass && <p className="mt-2 text-lg text-black">{liveClass.title}</p>}
    </div>
  );
}
