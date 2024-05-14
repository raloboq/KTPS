'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ThinkPage() {
  const [thought, setThought] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 seconds countdown
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeRemaining === 0) {
      // Navigate to the /pair page when time runs out
      router.push('/pair');
    }
  }, [timeRemaining, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Thought:', thought);

    // Navigate to the /pair page
    router.push('/pair');
  };

  return (
    <div>
      <h1>Think Page</h1>
      <p>Time Remaining: {timeRemaining} seconds</p>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Enter your thought..."
          value={thought}
          onChange={(e) => setThought(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}