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
/*'use client';

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
}*/
/*'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './thinkPage.module.css';
import { iniciarSesion } from '../api/sesiones';
import { registrarInteraccion } from '../api/interacciones';
import { guardarReflexion } from '../api/reflexiones';

export default function ThinkPage() {
  const [thought, setThought] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutos
  const [alias, setAlias] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const aliasParam = searchParams.get('alias');
    if (aliasParam) {
      setAlias(aliasParam);
      handleIniciarSesion(aliasParam);
    }

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeRemaining === 0) {
      handleSubmit();
    }
  }, [timeRemaining]);

  const handleIniciarSesion = async (alias: string) => {
    try {
      const id_sesion = await iniciarSesion(alias, 'La Influencia de las Redes Sociales en la Sociedad');
      setSessionId(id_sesion);
      // Registrar la interacción de inicio de sesión
      await handleRegistrarInteraccion('inicio_sesion', { alias });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  const handleRegistrarInteraccion = async (tipo: string, detalles: any) => {
    if (!sessionId) return;
    try {
      await registrarInteraccion(sessionId, tipo, detalles, '/think');
    } catch (error) {
      console.error('Error al registrar interacción:', error);
    }
  };

  const handleThoughtChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setThought(e.target.value);
    handleRegistrarInteraccion('escritura', { longitud: e.target.value.length });
  };

  const handleSubmit = async () => {
    if (!sessionId) return;
    try {
      await handleRegistrarInteraccion('envío', { contenido_final: thought });
      await guardarReflexion(sessionId, thought);
      const encodedUserName = encodeURIComponent(alias);
      router.push(`/pair?alias=${encodedUserName}`);
    } catch (error) {
      console.error('Error al enviar la reflexión:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  */
'use client';
  import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './thinkPage.module.css';
import { iniciarSesion } from '../api/sesiones';
import { registrarInteraccion } from '../api/interacciones';
import { guardarReflexion } from '../api/reflexiones';

const INTERACTION_SEND_INTERVAL = 3000; // 5 segundos
const CONTENT_CAPTURE_INTERVAL = 5000; // 30 segundos
const PAUSE_THRESHOLD = 3000; 

export default function ThinkPage() {
  const [thought, setThought] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [alias, setAlias] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const router = useRouter();

  const [lastTypingTime, setLastTypingTime] = useState<number | null>(null);
  const [pauseCount, setPauseCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseStartTimeRef = useRef<number | null>(null);
  const lastContentRef = useRef('');
  const pauseThreshold = 3000; // 3 segundos
  const lastCapturedContentRef = useRef('');
  const lastCaptureTimeRef = useRef(Date.now());

  const interactionsQueueRef = useRef<Array<{ tipo: string; detalles: any }>>([]);

  const sendInteractions = useCallback(async () => {
    if (sessionId && interactionsQueueRef.current.length > 0) {
      const interactionsToSend = [...interactionsQueueRef.current];
      interactionsQueueRef.current = [];

      try {
        await Promise.all(interactionsToSend.map(interaction => 
          registrarInteraccion(sessionId, interaction.tipo, interaction.detalles, '/think')
        ));
      } catch (error) {
        console.error('Error al enviar interacciones:', error);
        // Opcionalmente, podrías volver a agregar las interacciones fallidas a la cola
        interactionsQueueRef.current.push(...interactionsToSend);
      }
    }
  }, [sessionId]);

  useEffect(() => {
    const intervalId = setInterval(sendInteractions, INTERACTION_SEND_INTERVAL);
    return () => clearInterval(intervalId);
  }, [sendInteractions]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const aliasParam = searchParams.get('alias');
    if (aliasParam) {
      setAlias(aliasParam);
      handleIniciarSesion(aliasParam);
    }

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeRemaining === 0) {
      handleSubmit();
    }
  }, [timeRemaining]);

  /*useEffect(() => {
    let pauseTimer: NodeJS.Timeout;

    if (lastTypingTime) {
      pauseTimer = setTimeout(() => {
        setPauseCount(prevCount => prevCount + 1);
        queueInteraction('pausa_escritura', { duracion: pauseThreshold });
      }, pauseThreshold);
    }

    return () => clearTimeout(pauseTimer);
  }, [lastTypingTime]);*/

  useEffect(() => {
    let pauseTimer: NodeJS.Timeout;

    if (lastTypingTime && !isPaused) {
      pauseTimer = setTimeout(() => {
        setIsPaused(true);
        pauseStartTimeRef.current = Date.now();
      }, PAUSE_THRESHOLD);
    }

    return () => clearTimeout(pauseTimer);
  }, [lastTypingTime, isPaused]);

  const handleIniciarSesion = async (alias: string) => {
    try {
      const id_sesion = await iniciarSesion(alias, 'La Influencia de las Redes Sociales en la Sociedad');
      setSessionId(id_sesion);
      queueInteraction('inicio_sesion', { alias });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  const queueInteraction = (tipo: string, detalles: any) => {
    interactionsQueueRef.current.push({ tipo, detalles });
  };

  const captureContent = useCallback((currentContent: string, force: boolean = false) => {
    const currentTime = Date.now();
    if (force || currentTime - lastCaptureTimeRef.current >= CONTENT_CAPTURE_INTERVAL) {
      if (currentContent !== lastCapturedContentRef.current) {
        queueInteraction('captura_contenido', {
          contenido: currentContent,
          timestamp: currentTime,
        });
        lastCapturedContentRef.current = currentContent;
        lastCaptureTimeRef.current = currentTime;
      }
    }
  }, []);

  const handleThoughtChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const currentContent = e.target.value;
    setThought(currentContent);
    const currentTime = Date.now();

    if (isPaused) {
      const pauseDuration = pauseStartTimeRef.current ? currentTime - pauseStartTimeRef.current : 0;
      queueInteraction('pausa_escritura', { duracion: pauseDuration });
      setIsPaused(false);
      pauseStartTimeRef.current = null;
    }

    const lengthDiff = currentContent.length - lastContentRef.current.length;
    const largeDelete = lengthDiff < -10;
    const timeDiff = lastTypingTime ? (currentTime - lastTypingTime) / 1000 / 60 : 0;
    const typingSpeed = timeDiff > 0 ? Math.abs(lengthDiff) / timeDiff : 0;
    const newLineAdded = currentContent.split('\n').length > lastContentRef.current.split('\n').length;
    const punctuationAdded = /[.,!?;:]/.test(currentContent) && !/[.,!?;:]/.test(lastContentRef.current);

    queueInteraction('escritura', {
      longitud: currentContent.length,
      diferencia_longitud: lengthDiff,
      velocidad_escritura: Math.round(typingSpeed),
      eliminacion_grande: largeDelete,
      nueva_linea: newLineAdded,
      puntuacion_agregada: punctuationAdded,
      //pausas: pauseCount,
    });

    captureContent(currentContent);

    lastContentRef.current = currentContent;
    setLastTypingTime(currentTime);
    //setPauseCount(0);
  };

  const handleSubmit = async () => {
    if (!sessionId) return;
    try {
      if (isPaused) {
        const pauseDuration = pauseStartTimeRef.current ? Date.now() - pauseStartTimeRef.current : 0;
        queueInteraction('pausa_escritura', { duracion: pauseDuration });
      }
      captureContent(thought, true); // Forzar una captura final del contenido
      await sendInteractions(); // Enviar cualquier interacción pendiente
      queueInteraction('envío', { contenido_final: thought });
      await sendInteractions(); // Enviar la interacción de envío inmediatamente
      await guardarReflexion(sessionId, thought);
      const encodedUserName = encodeURIComponent(alias);
      router.push(`/pair?alias=${encodedUserName}`);
    } catch (error) {
      console.error('Error al enviar la reflexión:', error);
    }
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
          onChange={handleThoughtChange}
          className={styles.textarea}
        />
        <button type="submit" className={styles.button}>Enviar</button>
      </form>
    </div>
  );
}