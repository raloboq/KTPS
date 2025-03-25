/*
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
  const [timeRemaining, setTimeRemaining] = useState(30);
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
  const [showPopup, setShowPopup] = useState(false);

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

  const handleSave = () => {
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 30000); // Cierra el popup después de 3 segundos
  };

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
      captureContent(thought, true);
      await sendInteractions();
      queueInteraction('envío', { contenido_final: thought });
      await sendInteractions();

        // Obtener los parámetros de la URL actual
    const searchParams = new URLSearchParams(window.location.search);
    const roomId = searchParams.get('roomId');
    const roomName = searchParams.get('roomName');
    
    // Verificar que tenemos todos los parámetros necesarios
    if (!alias || !roomId) {
      console.error('Faltan parámetros necesarios para la redirección');
      return;
    }
      
      const encodedUserName = encodeURIComponent(alias);
      await guardarReflexion(sessionId, thought, encodedUserName);
      const encodedRoomName = roomName ? encodeURIComponent(roomName) : '';
      
     // router.push(`/pair?alias=${encodedUserName}`);
     router.push(`/pair?alias=${encodedUserName}&roomId=${roomId}${roomName ? `&roomName=${encodedRoomName}` : ''}`);

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
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className={styles.form}>
        <textarea
          placeholder="Escribe tus reflexiones aquí..."
          value={thought}
          onChange={handleThoughtChange}
          className={styles.textarea}
        />
        <button type="submit" className={styles.button}>Guardar</button>
      </form>
      {showPopup && (
        <div className={styles.popup}>
          <p>Gracias, espera a que el tiempo finalice para continuar</p>
        </div>
      )}
    </div>
  );
}*/
'use client';
  
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './thinkPage.module.css';
import { iniciarSesion } from '../api/sesiones';
import { registrarInteraccion } from '../api/interacciones';
import { guardarReflexion } from '../api/reflexiones';
import { IS_DEMO_MODE } from '@/utils/demoMode';

const INTERACTION_SEND_INTERVAL = 3000; // 3 segundos
const CONTENT_CAPTURE_INTERVAL = 5000; // 5 segundos
const PAUSE_THRESHOLD = 3000; 

export default function ThinkPage() {
  const [thought, setThought] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [alias, setAlias] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
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
  const [showPopup, setShowPopup] = useState(false);

  const interactionsQueueRef = useRef<Array<{ tipo: string; detalles: any }>>([]);
  const isRedirectingRef = useRef(false); // Para controlar redirecciones

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
    const roomIdParam = searchParams.get('roomId');
    const roomNameParam = searchParams.get('roomName');
    
    if (aliasParam) {
      setAlias(aliasParam);
      handleIniciarSesion(aliasParam);
    }
    
    if (roomIdParam) {
      setRoomId(roomIdParam);
    }
    
    if (roomNameParam) {
      setRoomName(roomNameParam);
    }

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          console.log('¡Se acabó el tiempo!');
          if (!isRedirectingRef.current) {
            handleSubmit();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSave = () => {
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000); // Cierra el popup después de 3 segundos
  };

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
    });

    captureContent(currentContent);

    lastContentRef.current = currentContent;
    setLastTypingTime(currentTime);
  };

  const handleSubmit = async () => {
    if (isRedirectingRef.current) return; // Evitar redirecciones múltiples
    isRedirectingRef.current = true;
    
    console.log('Iniciando proceso de submit y redirección a pair');
    
    try {
      if (isPaused) {
        const pauseDuration = pauseStartTimeRef.current ? Date.now() - pauseStartTimeRef.current : 0;
        queueInteraction('pausa_escritura', { duracion: pauseDuration });
      }
      
      // Asegurar que capturamos el contenido final
      captureContent(thought, true);
      await sendInteractions();
      queueInteraction('envío', { contenido_final: thought });
      await sendInteractions();
      
      // Guardamos la reflexión si tenemos sessionId
      if (sessionId) {
        try {
          await guardarReflexion(sessionId, thought, alias);
          console.log('Reflexión guardada exitosamente');
        } catch (error) {
          console.error('Error al guardar reflexión, pero continuando con redirección:', error);
        }
      } else if (IS_DEMO_MODE) {
        console.log('Modo demo: Simulando guardado de reflexión');
      } else {
        console.error('No se pudo guardar la reflexión: sessionId es null');
      }
      
      // Construir URL de redirección a la página pair
      let redirectUrl = '/pair';
      const queryParams = [];
      
      if (alias) {
        queryParams.push(`alias=${encodeURIComponent(alias)}`);
      }
      
      if (roomId) {
        queryParams.push(`roomId=${encodeURIComponent(roomId)}`);
      }
      
      if (roomName) {
        queryParams.push(`roomName=${encodeURIComponent(roomName)}`);
      }
      
      if (queryParams.length > 0) {
        redirectUrl += `?${queryParams.join('&')}`;
      }
      
      console.log('Redirigiendo a:', redirectUrl);
      router.push(redirectUrl);
    } catch (error) {
      console.error('Error en el proceso de submit:', error);
      isRedirectingRef.current = false; // Permitir reintentar si hay error
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
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className={styles.form}>
        <textarea
          placeholder="Escribe tus reflexiones aquí..."
          value={thought}
          onChange={handleThoughtChange}
          className={styles.textarea}
        />
        <button type="submit" className={styles.button}>Guardar</button>
      </form>
      {showPopup && (
        <div className={styles.popup}>
          <p>Gracias, espera a que el tiempo finalice para continuar</p>
        </div>
      )}
      {timeRemaining <= 5 && (
        <div className={styles.finalCountdown}>
          <p>Finalizando fase de reflexión. Preparándose para la colaboración en parejas...</p>
        </div>
      )}
    </div>
  );
}