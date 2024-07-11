'use client';

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './thinkPage.module.css';

export default function ThinkPage() {
  const [thought, setThought] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 seconds countdown
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const text1 = searchParams.get('alias');
    if (text1) {
      setThought(`Thinking about: ${decodeURIComponent(text1)}\n\n`);
    }

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);


  useEffect(() => {
    if (timeRemaining === 0) {
      router.push('/pair');
    }
  }, [timeRemaining, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Thought:', thought);
    router.push('/pair');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Think Page</h1>
      <p className={`${styles.timer} ${timeRemaining <= 30 ? styles.timerWarning : ''}`}>
        Time Remaining: {timeRemaining} seconds
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          placeholder="Enter your thought..."
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          className={styles.textarea}
        />
        <button type="submit" className={styles.button}>Submit</button>
      </form>
    </div>
  );
}