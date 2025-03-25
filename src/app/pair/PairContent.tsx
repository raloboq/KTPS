'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './pairPage.module.css';

export default function PairContent() {
  const [timeRemaining, setTimeRemaining] = useState(30); // 20 minutos son 1200
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const userName = searchParams.get('alias');

  useEffect(() => {
    const authenticateUser = async () => {
      if (!userName) {
        setAuthError('Nombre de usuario no proporcionado');
        return;
      }

      try {
        const response = await fetch('/api/liveblocks-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userName }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Authentication failed');
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error durante la autenticación:', error);
        setAuthError(error instanceof Error ? error.message : 'Ocurrió un error durante la autenticación');
      }
    };

    authenticateUser();
  }, [userName]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          console.log('¡Se acabó el tiempo!');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <>
      <h1 className={styles.title}>Fase de Discusión en Parejas</h1>
      <p className={styles.timer}>Tiempo restante: {formatTime(timeRemaining)}</p>
      <div className={styles.instructionsContainer}>
        <h2 className={styles.subtitle}>Instrucciones del Editor Colaborativo</h2>
        <p className={styles.welcome}>
          ¡Bienvenido al editor colaborativo, {userName}!
        </p>
        <ul className={styles.instructions}>
          <li>En esta fase, trabajarás con un compañero para discutir y comparar sus reflexiones individuales sobre el tema de las redes sociales.</li>
          <li>Utiliza el editor de texto compartido para escribir un resumen conjunto de sus ideas y conclusiones.</li>
          <li>Puedes formatear el texto usando la barra de herramientas en la parte superior del editor.</li>
          <li>Recuerda abordar las tres preguntas planteadas en la fase de reflexión individual.</li>
          <li>Al final de esta fase, deberán tener un documento que refleje la síntesis de sus ideas.</li>
        </ul>
        <p className={styles.encouragement}>
          ¡Aprovecha esta oportunidad para aprender de tu compañero y desarrollar una comprensión más profunda del tema!
        </p>
      </div>
    </>
  );
}