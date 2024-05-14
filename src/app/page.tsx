/*import Link from 'next/link'
export default function Page() {
    return (
    <>
    <h1>Hello, TKPS</h1>
    <Link href="/think">Think</Link>
    </>)
    
  }*/
  'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Text 1:', text1);
    console.log('Text 2:', text2);

    // Navigate to the /think page
    router.push('/think');
  };

  return (
    <>
      <h1>Hello, TKPS</h1>
      <Link href="/think">Think</Link>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter text 1"
          value={text1}
          onChange={(e) => setText1(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter text 2"
          value={text2}
          onChange={(e) => setText2(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}