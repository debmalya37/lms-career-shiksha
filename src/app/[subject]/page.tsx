"use client";
import { useParams } from 'next/navigation';
import SubjectOptions from '@/components/SubjectOptions'; // Reuse the SubjectOptions component

export default function SubjectPage() {
const { subject } = useParams(); 

return (
    <div className="bg-yellow-100 min-h-screen">
    <div className="container mx-auto">
        <input
        type="text"
        placeholder="Search"
        className="block w-full max-w-lg mt-6 mx-auto bg-green-100 p-2 rounded-md"
        />
        <h2 className="text-green-700 text-2xl font-bold mb-8 text-center">{subject}</h2>
        <SubjectOptions subject={subject} /> {/* Pass subject name as prop */}
    </div>
    </div>
    );


}
