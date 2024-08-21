/*'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './thinkPage.module.css';

export default function ThinkPage() {
  const [thought, setThought] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 seconds countdown
  const [alias, setAlias] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const text1 = searchParams.get('alias');
    if (text1) {
      setAlias(text1);
      setThought(`Thinking about: ${decodeURIComponent(text1)}\n\n`);
    }

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);

  useEffect(() => {
    if (timeRemaining === 0) {
      const encodedUserName = encodeURIComponent(alias);
      router.push(`/pair?alias=${encodedUserName}`);
    }
  }, [timeRemaining, router, alias]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Thought:', thought);
    const encodedUserName = encodeURIComponent(alias);
    router.push(`/pair?alias=${encodedUserName}`);
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
}*/
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './thinkPage.module.css';

export default function ThinkPage() {
  const [thought, setThought] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutos
  const [alias, setAlias] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const aliasParam = searchParams.get('alias');
    if (aliasParam) {
      setAlias(aliasParam);
    }

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);

  useEffect(() => {
    if (timeRemaining === 0) {
      handleSubmit();
    }
  }, [timeRemaining]);

  const handleSubmit = () => {
    console.log('Thought:', thought);
    const encodedUserName = encodeURIComponent(alias);
    router.push(`/pair?alias=${encodedUserName}`);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fase de Reflexión Individual</h1>
      <p className={`${styles.timer} ${timeRemaining <= 120 ? styles.timerWarning : ''}`}>
        Tiempo Restante: {formatTime(timeRemaining)}
      </p>
      <div className={styles.topicContainer}>
        <h2 className={styles.topicTitle}>Tema: La Influencia de las Redes Sociales en la Sociedad</h2>
        <p className={styles.topicSummary}>
          Las redes sociales han transformado la manera en que las personas se comunican, interactúan y acceden a la información. 
          Plataformas como Facebook, Twitter, Instagram y TikTok tienen un impacto significativo en varios aspectos de la vida cotidiana, 
          incluyendo la política, la economía, la salud mental y las relaciones interpersonales. Mientras que las redes sociales ofrecen 
          oportunidades para la conexión y el acceso a información, también presentan desafíos como la desinformación, la adicción a la 
          tecnología y los efectos negativos en la autoestima y la privacidad.
        </p>
        <h3 className={styles.questionsTitle}>Preguntas para Reflexionar:</h3>
        <ol className={styles.questionsList}>
          <li>¿Cuáles son los principales beneficios de las redes sociales para la sociedad?</li>
          <li>¿Qué desafíos y riesgos plantean las redes sociales?</li>
          <li>¿Qué medidas se podrían tomar para mitigar los efectos negativos de las redes sociales?</li>
        </ol>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className={styles.form}>
        <textarea
          placeholder="Escribe tus reflexiones aquí..."
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          className={styles.textarea}
        />
        <button type="submit" className={styles.button}>Enviar</button>
      </form>
    </div>
  );
}