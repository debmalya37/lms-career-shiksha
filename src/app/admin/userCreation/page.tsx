"use client";
import { useEffect, useState } from 'react';

interface User {
  name: string;
  email: string;
  password: string; // Hash this in production
  subscriptionDays: number;
  course: string;
}

interface Course {
  _id: string;
  title: string;
}

const UserCreationPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subscriptionDays, setSubscriptionDays] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/course');
        const data = await response.json();
        if (Array.isArray(data)) {
          setCourses(data);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/usercreation');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchCourses();
    fetchUsers();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const userData = { name, email, password, subscriptionDays, course: selectedCourse };

    try {
      const response = await fetch('/api/usercreation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const newUser: User = await response.json();
        setUsers((prevUsers) => [...prevUsers, newUser]);
        // Clear form fields after submission
        setName('');
        setEmail('');
        setPassword('');
        setSubscriptionDays('');
        setSelectedCourse('');
      } else {
        console.error('Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-md max-w-full mt-8 text-black">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">User Creation</h1>
      <form onSubmit={handleSubmit}>
        {/* Form Fields */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
          title="text"
            type="text"
            className="border p-2 w-full rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
          title="text"
            type="email"
            className="border p-2 w-full rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
          title="text"
            type="password"
            className="border p-2 w-full rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subscription (Days)</label>
          <input
          title="text"
            type="number"
            className="border p-2 w-full rounded-md"
            value={subscriptionDays}
            onChange={(e) => setSubscriptionDays(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
          <select
          title="text"
            className="border p-2 w-full rounded-md text-black"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            required
          >
            <option value="">--Select a Course--</option>
            {courses.map((course: any) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
          Add User
        </button>
      </form>
      {/* User Table */}
      <h2 className="text-xl font-bold text-blue-600 mt-6">User List</h2>
      <table className="min-w-full mt-4 bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Password</th>
            <th className="border px-4 py-2">Subscription (Days)</th>
            <th className="border px-4 py-2">Course</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: User, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.password}</td>
              <td className="border px-4 py-2">{user.subscriptionDays}</td>
              <td className="border px-4 py-2">{user.course}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserCreationPage;
