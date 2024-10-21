export default function Subjects() {
    const subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography'];
  
    return (
      <div className="mt-8 p-4">
        <h2 className="text-green-700 text-2xl font-bold mb-4">Subjects</h2>
        <div className="grid grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div key={subject} className="bg-red-200 h-40 rounded-lg flex justify-center items-center">
              <p className="text-lg">{subject}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  