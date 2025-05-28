// /components/OAuthButton.tsx
import React from 'react';

export default function OAuthButton() {
  return (
    <a
      href="/api/oauth/authorize"
      className="px-4 py-2 bg-red-600 text-white rounded"
    >
      Sign in with Google
    </a>
  );
}
