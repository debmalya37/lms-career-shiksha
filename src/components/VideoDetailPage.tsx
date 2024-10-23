import Link from 'next/link';

export default function VideoGrid({ videos }: { videos: { title: string, url: string }[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {videos.map((video, index) => (
        <Link key={index} href={`/videos/${index}`}>
          <div className="bg-red-200 h-40 rounded-lg flex justify-center items-center cursor-pointer hover:bg-red-300">
            <p className="text-lg">{video.title}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
