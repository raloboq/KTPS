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
/*'use client';
  
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
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
  const [timeRemaining, setTimeRemaining] = useState(30); // 15 minutos es 900
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
    // Obtener datos de las cookies
    const studentUsername = Cookies.get('studentUsername');
    const roomIdFromCookie = Cookies.get('roomId');
    const roomNameFromCookie = Cookies.get('roomName');
    
    if (studentUsername) {
      setAlias(studentUsername);
      handleIniciarSesion(studentUsername);
    } else {
      console.error('No se encontró nombre de usuario en las cookies');
    }
    
    if (roomIdFromCookie) {
      setRoomId(roomIdFromCookie);
    } else {
      console.error('No se encontró ID de sala en las cookies');
    }
    
    if (roomNameFromCookie) {
      setRoomName(roomNameFromCookie);
    } else {
      console.error('No se encontró nombre de sala en las cookies');
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
      if (sessionId && alias) {
        try {
          await guardarReflexion(sessionId, thought, alias);
          console.log('Reflexión guardada exitosamente');
        } catch (error) {
          console.error('Error al guardar reflexión, pero continuando con redirección:', error);
        }
      } else if (IS_DEMO_MODE) {
        console.log('Modo demo: Simulando guardado de reflexión');
      } else {
        console.error('No se pudo guardar la reflexión: sessionId o alias es null');
      }
      
      // Redirección simple sin parámetros en la URL
      console.log('Redirigiendo a pair');
      router.push('/pair');
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
}*/
'use client';
  
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import styles from './thinkPage.module.css';
import { iniciarSesion } from '../api/sesiones';
import { finalizarSesion } from '../api/sesiones';
import { registrarInteraccion } from '../api/interacciones';
import { guardarReflexion } from '../api/reflexiones';

const INTERACTION_SEND_INTERVAL = 3000; // 3 seconds
const CONTENT_CAPTURE_INTERVAL = 5000; // 5 seconds
const PAUSE_THRESHOLD = 3000; 

interface ActivityConfig {
  think_phase_instructions: string;
  think_phase_duration: number;
  assignment_name: string;
  course_name: string;
}

export default function ThinkPage() {
  const [thought, setThought] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0); // Will be set dynamically
  const [alias, setAlias] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [activityConfig, setActivityConfig] = useState<ActivityConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // For interaction tracking
  const [lastTypingTime, setLastTypingTime] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const pauseStartTimeRef = useRef<number | null>(null);
  const lastContentRef = useRef('');
  const lastCapturedContentRef = useRef('');
  const lastCaptureTimeRef = useRef(Date.now());
  const [showPopup, setShowPopup] = useState(false);
  const interactionsQueueRef = useRef<Array<{ tipo: string; detalles: any }>>([]);
  const isRedirectingRef = useRef(false); // To prevent multiple redirects

  // Function to fetch activity configuration
  const fetchActivityConfiguration = async () => {
    try {
      const roomIdFromCookie = Cookies.get('roomId');
      
      if (!roomIdFromCookie) {
        throw new Error('Room ID not found in cookies');
      }
      
      const response = await fetch(`/api/student/check-room-status`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity configuration');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load activity data');
      }

      // Asegúrate de extraer también el tps_configuration_id
    const configId = data.room.tps_configuration_id || data.room.configuration_id;
    console.log("Configuration ID encontrado:", configId);
    
      
      // Get the configuration from the response
      return {
        think_phase_instructions: data.room.think_phase_instructions,
        think_phase_duration: data.room.think_phase_duration,
        assignment_name: data.room.activity_name,
        course_name: data.room.course_name || 'Course',
        tps_configuration_id: configId
      };
    } catch (error) {
      console.error('Error fetching activity configuration:', error);
      return null;
    }
  };

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
        // Optionally re-add failed interactions to the queue
        interactionsQueueRef.current.push(...interactionsToSend);
      }
    }
  }, [sessionId]);

  useEffect(() => {
    const intervalId = setInterval(sendInteractions, INTERACTION_SEND_INTERVAL);
    return () => clearInterval(intervalId);
  }, [sendInteractions]);

  useEffect(() => {
    // Get data from cookies and initialize session
    const initSession = async () => {
      try {
        // Get user data from cookies
        const studentUsername = Cookies.get('studentUsername');
        const roomIdFromCookie = Cookies.get('roomId');
        const roomNameFromCookie = Cookies.get('roomName');
        const activityIdFromCookie = Cookies.get('activityId');
        
        console.log("roomId:", roomIdFromCookie);
        console.log("roomName:", roomNameFromCookie);
        console.log("activityId:", activityIdFromCookie);
        
        if (studentUsername) {
          setAlias(studentUsername);
        } else {
          throw new Error('No se encontró nombre de usuario en las cookies');
        }
        
        if (roomIdFromCookie) {
          setRoomId(roomIdFromCookie);
        } else {
          throw new Error('No se encontró ID de sala en las cookies');
        }
        
        if (roomNameFromCookie) {
          setRoomName(roomNameFromCookie);
        }
    
        // Obtener explícitamente el tps_configuration_id
        let tpsConfigurationId = null;
        
        if (activityIdFromCookie) {
          try {
            // Usar el nuevo endpoint específico
            const configResponse = await fetch(`/api/student/get-config-id?activityId=${activityIdFromCookie}&roomId=${roomIdFromCookie}`);
            if (configResponse.ok) {
              const configData = await configResponse.json();
              if (configData.success && configData.config_id) {
                tpsConfigurationId = configData.config_id;
                console.log("tps_configuration_id obtenido directamente:", tpsConfigurationId);
              }
            }
          } catch (configError) {
            console.error('Error al obtener tps_configuration_id:', configError);
          }
        }
        
        // Fetch the activity configuration
        const config = await fetchActivityConfiguration();
        
        if (config) {
          setActivityConfig(config);
          // Set timer based on the configuration
          setTimeRemaining(config.think_phase_duration);
        } else {
          // Use default values if configuration not available
          setTimeRemaining(900); // 15 minutes as default
        }
        
        // Initialize session
        if (studentUsername) {
          console.log("Iniciando sesión con params:", {
            usuario: studentUsername,
            tema: config?.assignment_name || 'Think-Pair-Share Activity',
            tps_configuration_id: tpsConfigurationId
          });
          
          const id_sesion = await iniciarSesion(
            studentUsername, 
            config?.assignment_name || 'Think-Pair-Share Activity',
            tpsConfigurationId 
          );
          
          console.log("Sesión iniciada con ID:", id_sesion);
          setSessionId(id_sesion);
          queueInteraction('inicio_sesion', { alias: studentUsername });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing session:', error);
        setError(error instanceof Error ? error.message : 'Error al inicializar la sesión');
        setLoading(false);
      }
    };

    initSession();
  }, []);

  // Set up timer
  useEffect(() => {
    if (loading || timeRemaining <= 0) return;
    
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
  }, [loading, timeRemaining]);

  const handleSave = () => {
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000); // Close popup after 3 seconds
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
    if (isRedirectingRef.current) return; // Prevent multiple redirects
    isRedirectingRef.current = true;
    
    console.log('Iniciando proceso de submit y redirección a pair');
    
    try {
      if (isPaused) {
        const pauseDuration = pauseStartTimeRef.current ? Date.now() - pauseStartTimeRef.current : 0;
        queueInteraction('pausa_escritura', { duracion: pauseDuration });
      }
      
      // Ensure we capture the final content
      captureContent(thought, true);
      await sendInteractions();
      queueInteraction('envío', { contenido_final: thought });
      await sendInteractions();
      
      // Finalizar la sesión si tenemos un sessionId
    if (sessionId) {
      try {
        await finalizarSesion(sessionId);
        console.log('Sesión finalizada exitosamente');
      } catch (finishError) {
        console.error('Error al finalizar sesión:', finishError);
      }
    }

      // Save the reflection if we have sessionId
      if (sessionId && alias) {
        try {
          await guardarReflexion(sessionId, thought, alias);
          console.log('Reflexión guardada exitosamente');
        } catch (error) {
          console.error('Error al guardar reflexión, pero continuando con redirección:', error);
        }
      }
      
      // Simple redirection without URL parameters
      console.log('Redirigiendo a pair');
      router.push('/pair');
    } catch (error) {
      console.error('Error en el proceso de submit:', error);
      isRedirectingRef.current = false; // Allow retry if there's an error
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Cargando actividad...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h1>Error</h1>
        <p>{error}</p>
        <button 
          onClick={() => router.push('/activity-select')}
          className={styles.button}
        >
          Volver a selección de actividades
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fase de Reflexión Individual</h1>
      <p className={`${styles.timer} ${timeRemaining <= 120 ? styles.timerWarning : ''}`}>
        Tiempo Restante: {formatTime(timeRemaining)}
      </p>
      <div className={styles.topicContainer}>
        <h2 className={styles.topicTitle}>
          {activityConfig?.assignment_name || 'Actividad Think-Pair-Share'}
        </h2>
        
        <div className={styles.instructionsContent}>
          {activityConfig?.think_phase_instructions || 
            "Por favor reflexiona sobre la actividad propuesta. No se encontraron instrucciones específicas."}
        </div>
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