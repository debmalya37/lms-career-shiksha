"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const generateDeviceIdentifier = () => {
  // Generate a simple unique identifier (improve for better uniqueness)
  return 'device-' + Math.random().toString(36).substring(2, 15);
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if a device identifier is already stored; if not, create one
    if (!localStorage.getItem('deviceIdentifier')) {
      localStorage.setItem('deviceIdentifier', generateDeviceIdentifier());
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const deviceIdentifier = localStorage.getItem('deviceIdentifier');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, deviceIdentifier }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('sessionToken', data.sessionToken);
        router.push('/');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to log in');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('An error occurred during login');
    }
  };

  return (
    <div className="container mx-auto p-8 bg-yellow-100 rounded-lg shadow-md max-w-md mt-8 text-black">
  <h1 className="text-2xl font-bold text-blue-600 mb-4">Sign In</h1>
  {errorMessage && <p className="text-red-600">{errorMessage}</p>}
  <form onSubmit={handleSubmit}>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
      <input
        title="email"
        type="email"
        className="border p-2 w-full rounded-md text-black"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
      <input
        title="password"
        type="password"
        className="border p-2 w-full rounded-md text-black"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
    </div>
    <button
      type="submit"
      className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
    >
      Sign In
    </button>
  </form>
  <div className="mt-4 text-center">
    <p>
      New user?{' '}
      <a
        href="/signup"
        className="text-blue-500 hover:underline"
      >
        Register here
      </a>
    </p>
  </div>
</div>

  );
};

export default LoginPage;
