import Link from 'next/link';

interface SubjectOptionsProps {
  subject: string | string[]; // Can handle both string or array (Next.js dynamic routing)
}

export default function SubjectOptions({ subject }: SubjectOptionsProps) {
  return (
    <div className="mt-8 p-4">
      <div className="flex justify-center space-x-10">
        <Link href={`/${subject}/videos`}>
          <div className="bg-green-200 w-40 h-40 flex justify-center items-center rounded-lg hover:bg-green-300 cursor-pointer">
            <p className="text-lg font-bold">Video</p>
          </div>
        </Link>
        <Link href={`/${subject}/notes`}>
          <div className="bg-green-200 w-40 h-40 flex justify-center items-center rounded-lg hover:bg-green-300 cursor-pointer">
            <p className="text-lg font-bold">Notes</p>
          </div>
        </Link>
        <Link href={`/${subject}/test-series`}>
          <div className="bg-green-200 w-40 h-40 flex justify-center items-center rounded-lg hover:bg-green-300 cursor-pointer">
            <p className="text-lg font-bold">Test Series</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
