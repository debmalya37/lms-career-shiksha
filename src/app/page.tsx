import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to the LMS</h1>
      <nav>
        <Link href="/tutorials">Tutorials</Link>
        <Link href="/live-classes">Live Classes</Link>
        <Link href="/notes">Notes</Link>
        <Link href="/test-series">Test Series</Link>
      </nav>
    </div>
  );
}
