import React from 'react';

const notes = [
  { id: 1, title: 'Note 1', url: '/pdfs/note1.pdf' },
  { id: 2, title: 'Note 2', url: '/pdfs/note2.pdf' },
];

export default function NotesPage() {
  return (
    <div>
      <h1>Notes</h1>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((note) => (
            <tr key={note.id}>
              <td>{note.title}</td>
              <td>
                <a href={note.url} download>
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
