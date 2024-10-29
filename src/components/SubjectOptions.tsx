import Link from 'next/link';

interface SubjectOptionsProps {
  subject: string | string[] | undefined; // Can handle both string or array (Next.js dynamic routing)
}

export default function SubjectOptions({ subject }: SubjectOptionsProps) {
  return (
    <div className="mt-8 p-4">
      <div className="flex justify-center flex-wrap gap-3 mb-1">

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
        <Link href={`/${subject}/ebook`}>
          <div className="bg-green-200 w-40 h-40 flex justify-center items-center rounded-lg hover:bg-green-300 cursor-pointer">
            <p className="text-lg font-bold">eBook</p>
          </div>
        </Link>
        <Link href={`/${subject}/progress`}>
          <div className="bg-green-200 w-40 h-40 flex justify-center items-center rounded-lg hover:bg-green-300 cursor-pointer">
            <p className="text-lg font-bold">Progress</p>
          </div>
        </Link>
        <Link href={`/${subject}/topics`}>
          <div className="bg-green-200 w-40 h-40 flex justify-center items-center rounded-lg hover:bg-green-300 cursor-pointer">
            <p className="text-lg font-bold">Topics</p>
          </div>
        </Link>
        <Link href={`/${subject}/question-paper`}>
          <div className="bg-green-200 w-40 h-40 flex justify-center items-center rounded-lg hover:bg-green-300 cursor-pointer">
            <p className="text-lg font-bold">Question Paper</p>
          </div>
        </Link>
        <Link href={`/${subject}/query`}>
          <div className="bg-green-200 w-40 h-40 flex justify-center items-center rounded-lg hover:bg-green-300 cursor-pointer">
            <p className="text-lg font-bold">Query</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
