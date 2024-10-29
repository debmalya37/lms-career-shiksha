import Link from 'next/link';

export default function VideoGrid({ videos, subject }: { videos: { title: string, id: number, url: string }[], subject: string }) {
  return (
    <div className="grid grid-cols-3 gap-4 ml-2">
      {videos.map((video) => (
        <Link key={video.id} href={`/${subject}/videos/${video.id}`} passHref>
          <div className="bg-red-200 h-40 rounded-lg flex justify-center items-center cursor-pointer hover:bg-red-300">
            <p className="text-lg">{video.title}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
