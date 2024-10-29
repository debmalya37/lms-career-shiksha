"use client";
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [aim, setAim] = useState('');
  const [progress, setProgress] = useState(0); // State for progress

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile');
        const profile = await res.json();
        if (!profile.error) {
          setFirstName(profile.firstName);
          setLastName(profile.lastName);
          setEmail(profile.email);
          setSubject(profile.subject);
          setAim(profile.aim);
          // Assume you have a way to fetch total marks and total tests
          const totalMarks = 100; // Replace with actual total marks
          const obtainedMarks = 70; // Replace with actual obtained marks
          setProgress((obtainedMarks / totalMarks) * 100);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profileData = { userId: '12345', firstName, lastName, email, subject, aim };

    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-md max-w-xl mt-8">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">User Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            title='firstN'
            type="text"
            className="border p-2 w-full rounded-md text-gray-950"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            title='lastN'
            type="text"
            className="border p-2 w-full rounded-md text-gray-950"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            title='email'
            type="email"
            className="border p-2 w-full rounded-md text-gray-950"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <input
            title='sub'
            type="text"
            className="border p-2 w-full rounded-md text-gray-950"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Aim</label>
          <select
            title='aim'
            className="border p-2 w-full rounded-md text-gray-950"
            value={aim}
            onChange={(e) => setAim(e.target.value)}
            required
          >
            <option value="">Select Aim</option>
            <option value="prelims">Prelims</option>
            <option value="mains">Mains</option>
          </select>
        </div>
        
        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
          Submit
        </button>
      </form>

      {/* Progress Bar */}
      <div className="mt-8 text-gray-950">
        <h2 className="text-lg font-semibold">Progress</h2>
        <div className="h-4 bg-gray-200 rounded-full">
          <div
            className="bg-green-600 h-full rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm">{progress.toFixed(2)}% Completed</p>
      </div>
    </div>
  );
}
