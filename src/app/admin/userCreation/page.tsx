'use client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CSVLink } from "react-csv"; // Import CSV download helper
import { XCircleIcon } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  subscription: number;
  phoneNo: string;
  address: string;
  createdAt: string; // Added createdAt field
  course?: {
    _id: string;
    title: string;
  }[];
  deviceIdentifier?: string | null;
}

interface Course {
  _id: string;
  title: string;
}

const UserCreationPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subscription, setSubscription] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [phoneNo, setPhoneNo] = useState('');
  const [address, setAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // new search query state

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Fetch profile data from the API
        const profileRes = await fetch(`/api/profile`);
        const profileData = await profileRes.json();

        console.log('Profile Data:', profileData); // Log the profile response

        // Define allowed emails
        const allowedEmails = ['civilacademy.in@gmail.com', 'civilacademy98@gmail.com', 'debmalyasen37@gmail.com', 'Tech@kryptaroid.com'];

        // Check if the profile email is in the allowed list
        if (profileData?.email && allowedEmails.includes(profileData.email)) {
          console.log("admin access allowed");
          setIsAdmin(true);
        } else {
          router.push('/'); // Redirect to home if not authorized
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        router.push('/'); // Redirect to home on error
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [router, isAdmin]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`/api/course`);
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/usercreation`);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
    fetchCourses();
  }, []);

  const handleEdit = (user: User) => {
    setName(user.name);
    setEmail(user.email);
    setPassword(user.password);
    setSubscription(String(user.subscription));
    setPhoneNo(user.phoneNo);
    setAddress(user.address);
    setSelectedCourses(user.course ? user.course.map((c) => c._id) : []);
    setIsEditing(true);
    setCurrentUserId(user._id);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentUserId(null);
    setName('');
    setEmail('');
    setPassword('');
    setSubscription('');
    setPhoneNo('');
    setAddress('');
    setSelectedCourses([]);
  };

  const handleDeleteDeviceIdentifier = async (userId: string) => {
    try {
      const response = await fetch(`/api/usercreation/deleteDeviceIdentifier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, deviceIdentifier: null } : user
          )
        );
        alert('Device Identifier deleted successfully.');
      } else {
        console.error('Failed to delete device identifier.');
        alert('Failed to delete device identifier.');
      }
    } catch (error) {
      console.error('Error deleting device identifier:', error);
    }
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses((prevSelected) =>
      prevSelected.includes(courseId)
        ? prevSelected.filter((id) => id !== courseId)
        : [...prevSelected, courseId]
    );
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const userData = {
      id: currentUserId,
      name,
      email,
      password,
      subscription: Number(subscription),
      phoneNo,
      address,
      course: selectedCourses,
    };

    if (isEditing && currentUserId) {
      try {
        const response = await fetch(`/api/updateUser`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          const updatedUser: User = await response.json();
          setUsers((prevUsers) =>
            prevUsers.map((user) => (user._id === updatedUser._id ? updatedUser : user))
          );
          handleCancelEdit();
        } else {
          console.error('Failed to update user');
        }
      } catch (error) {
        console.error('Error updating user:', error);
      }
    } else {
      try {
        const response = await fetch(`/api/usercreation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          const newUser: User = await response.json();
          setUsers((prevUsers) => [...prevUsers, newUser]);
          handleCancelEdit();
          setName('');
          setEmail('');
          setPassword('');
          setSubscription('');
          setSelectedCourses([]);
        } else {
          console.error('Failed to add user');
        }
      } catch (error) {
        console.error('Error adding user:', error);
      }
    }
  };

  const generateCSVData = () => {
    return users.map((user) => ({
      Name: user.name,
      Email: user.email,
      Password: user.password,
      Subscription: user.subscription,
      PhoneNo: user.phoneNo,
      Address: user.address,
      CreatedAt: new Date(user.createdAt).toLocaleDateString(),
      Courses: user.course?.map((course) => course.title).join(", ") || "No course",
      DeviceIdentifier: user.deviceIdentifier || "N/A",
    }));
  };

  // NEW: Filter users based on search query

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.address.toLowerCase().includes(query) ||
      user.password.toLowerCase().includes(query)
    );
  });

  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-md max-w-full mt-8 text-black">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">User Creation</h1>
      
      {/* Search Box */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, address, password"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 w-full rounded-md"
        />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            title="name"
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
            title="email"
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
            title="password"
            type="text"
            className="border p-2 w-full rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subscription (Days)</label>
          <input
            title="subscription"
            type="number"
            className="border p-2 w-full rounded-md"
            value={subscription}
            onChange={(e) => setSubscription(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone No</label>
          <input
            title="phone"
            type="number"
            className="border p-2 w-full rounded-md"
            value={phoneNo}
            onChange={(e) => setPhoneNo(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input
            title="address"
            type="text"
            className="border p-2 w-full rounded-md"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Courses</label>
          <div>
            {courses.map((course) => (
              <div key={course._id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={course._id}
                  value={course._id}
                  checked={selectedCourses.includes(course._id)}
                  onChange={() => toggleCourseSelection(course._id)}
                  className="mr-2"
                />
                <label htmlFor={course._id}>{course.title}</label>
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className={`${
            isEditing ? 'bg-yellow-500' : 'bg-green-600'
          } text-white py-2 px-4 rounded-md hover:bg-green-700`}
        >
          {isEditing ? 'Update User' : 'Add User'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="ml-2 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>
      <div className="mt-4">
        <CSVLink
          data={generateCSVData()}
          filename="users_data.csv"
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Download CSV
        </CSVLink>
      </div>
      <h2 className="text-xl font-bold text-blue-600 mt-6">User List</h2>
      <table className="min-w-full mt-4 bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Password</th>
            <th className="border px-4 py-2">Subscription (Days)</th>
            <th className="border px-4 py-2">Phone No</th>
            <th className="border px-4 py-2">Address</th>
            <th className="border px-4 py-2">Courses</th>
            <th className="border px-4 py-2">Device Identifier</th>
            <th className="border px-4 py-2">Created At</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user: User) => (
            <tr key={user._id}>
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.password}</td>
              <td className="border px-4 py-2 text-center">{user.subscription}</td>
              <td className="border px-4 py-2 text-center">{user.phoneNo}</td>
              <td className="border px-4 py-2 text-center">{user.address}</td>
              <td className="border px-4 py-2">
                {user.course?.map((course, idx) => (
                  <div key={idx}>{course.title}</div>
                )) || 'No course'}
              </td>
              <td className="border px-4 py-2 text-center">{user.deviceIdentifier || 'N/A'}</td>
              <td className="border px-4 py-2 text-center">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not Available"}
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="bg-blue-500 text-white py-1 px-3 hover:bg-blue-600 rounded-md"
                >
                  Edit
                </button>
                {user.deviceIdentifier && (
                  <button
                    onClick={() => handleDeleteDeviceIdentifier(user._id)}
                    className="bg-red-500 text-white py-1 px-3 ml-2 rounded-md hover:bg-red-600"
                  >
                    Delete Device
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>
  );
};

export default UserCreationPage;
