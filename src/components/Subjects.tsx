import Link from 'next/link';

export default function Subjects() {
  const subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography'];

  return (
    <div className="mt-8 p-4">
      <h2 className="text-green-700 text-2xl font-bold mb-4">Subjects</h2>
      <div className="grid grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <Link key={subject} href={`/${subject.toLowerCase()}`}>
            <div className="bg-green-200 w-full h-40 flex justify-center items-center rounded-lg hover:bg-green-300 cursor-pointer">
              <p className="text-lg font-bold">{subject}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
