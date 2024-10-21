import React from 'react';

const notes = [
  { id: 1, title: 'Note 1', url: '/pdfs/note1.pdf' },
  { id: 2, title: 'Note 2', url: '/pdfs/note2.pdf' },
];

export default function NotesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Notes</h1>
      <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
        <table className="min-w-full text-left table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Download</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => (
              <tr key={note.id} className="border-b">
                <td className="px-4 py-2">{note.title}</td>
                <td className="px-4 py-2">
                  <a href={note.url} download className="text-blue-600 hover:underline">
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
