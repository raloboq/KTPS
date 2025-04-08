/*'use client';

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
}*/
'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import styles from './pairPage.module.css';

interface PairConfig {
  pair_phase_instructions: string;
  pair_phase_duration: number;
  activity_name: string;
}

export default function PairContent() {
  const [timeRemaining, setTimeRemaining] = useState(0); // Will be set dynamically
  const [pairConfig, setPairConfig] = useState<PairConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    // Get the user name from cookies
    const studentUsername = Cookies.get('studentUsername');
    if (studentUsername) {
      setUserName(studentUsername);
    }

    // Fetch configuration
    const fetchRoomConfig = async () => {
      try {
        const response = await fetch('/api/student/check-room-status');
        if (!response.ok) {
          throw new Error('Error al cargar configuración de la sala');
        }
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Error al cargar datos de la actividad');
        }
        
        // Set the pair configuration
        setPairConfig({
          pair_phase_instructions: data.room.pair_phase_instructions,
          pair_phase_duration: data.room.pair_phase_duration,
          activity_name: data.room.activity_name
        });
        
        // Set the timer
        setTimeRemaining(data.room.pair_phase_duration);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pair configuration:', error);
        setError(error instanceof Error ? error.message : 'Error al cargar configuración');
        setLoading(false);
      }
    };
    
    fetchRoomConfig();
  }, []);

  useEffect(() => {
    if (loading || timeRemaining <= 0) return;
    
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
  }, [loading, timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Cargando configuración de la sala...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <h1 className={styles.title}>Fase de Discusión en Parejas</h1>
      <p className={styles.timer}>Tiempo restante: {formatTime(timeRemaining)}</p>
      <div className={styles.instructionsContainer}>
        <h2 className={styles.subtitle}>
          {pairConfig?.activity_name || 'Discusión en Parejas'}
        </h2>
        <p className={styles.welcome}>
          ¡Bienvenido al editor colaborativo, {userName}!
        </p>
        <div className={styles.instructions}>
          {pairConfig?.pair_phase_instructions || 
           "No se encontraron instrucciones específicas para esta fase. Por favor, colabora con tu compañero en el documento compartido."}
        </div>
        <p className={styles.encouragement}>
          ¡Aprovecha esta oportunidad para aprender de tu compañero y desarrollar una comprensión más profunda del tema!
        </p>
      </div>
    </>
  );
}