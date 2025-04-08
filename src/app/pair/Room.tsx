//esta es la version anterior que funcionaba en vercel
/*
'use client';
import { ReactNode, useState, useEffect, useCallback } from 'react';
import { RoomProvider } from '@/liveblocks.config';
import { ClientSideSuspense } from '@liveblocks/react';
import { Loading } from '@/components/Loading';
import { useRouter } from 'next/navigation';
import UseRoomId from './UseRoomId';
import ChatArea from "../chat/components/Chatarea";
import styles from './pairPage.module.css';

//liveblocks:examples:ROOM2

const CUSTOM_SYSTEM_INSTRUCTION = "Eres un asistente de investigación especializado en el impacto de las redes sociales en la sociedad. Ayuda a los estudiantes a reflexionar sobre los beneficios, desafíos y posibles soluciones relacionadas con las redes sociales, sin proporcionar respuestas directas. Fomenta el pensamiento crítico y la discusión.";

export function Room({ children }: { children: ReactNode }) {
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutos
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const { roomInfo, loading, error } = UseRoomId(userName|| '');
  const [reflexion, setReflexion] = useState<string | null>(null);
  const [showReflexion, setShowReflexion] = useState(false);

  const finalizarSesionColaborativa = useCallback(async () => {
    if (roomInfo?.id) {
      try {
        await fetch('/api/finalizar-sesion-colaborativa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_sesion_colaborativa: roomInfo.id })
        });
        console.log('Sesión colaborativa finalizada');
        setShowPopup(true);
      } catch (error) {
        console.error('Error al finalizar sesión colaborativa:', error);
      }
    }
    else {
      console.error('No se pudo finalizar sesión colaborativa. roomInfo.id no existe');
    }
  }, [roomInfo?.id]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const userNameFromQuery = searchParams.get('alias');
    if (userNameFromQuery) {
      localStorage.setItem('userName', userNameFromQuery);
      setUserName(userNameFromQuery);
      obtenerReflexion(userNameFromQuery);
    }

    const authenticateUser = async () => {
      if (!userNameFromQuery) {
        setAuthError('Nombre de usuario no proporcionado');
        return;
      }

      try {
        const response = await fetch('/api/liveblocks-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userName: userNameFromQuery }),
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
  }, []);

  const obtenerReflexion = async (alias: string) => {
    try {
      console.log(`/api/obtener-reflexion?alias=${encodeURIComponent(alias)}`);
      const response = await fetch(`/api/obtener-reflexion?alias=${encodeURIComponent(alias)}`);
      if (response.ok) {
        const data = await response.json();
        setReflexion(data.reflexion);
      } else if (response.status === 404) {
        console.log('No se encontró reflexión para este usuario');
        setReflexion(null);
      } else {
        console.error('Error al obtener la reflexión:', await response.text());
      }
    } catch (error) {
      console.error('Error al obtener la reflexión:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          console.log('¡Se acabó el tiempo!');
          finalizarSesionColaborativa();
          // Aquí podrías añadir lógica adicional, como redirigir a una página de resumen
          
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isAuthenticated,finalizarSesionColaborativa]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (!userName) return <Loading />;
  if (loading) return <Loading />;
  if (error) return <div className={styles.error}>Error: {(error as Error).message}</div>;
  if (authError) return <div className={styles.error}>Error de autenticación: {authError}</div>;
  if (!isAuthenticated) return <Loading />;


  return (
   // <RoomProvider id={RoomId || roomId} initialPresence={{ cursor: null }}>
   //<RoomProvider id={roomInfo.id || 'default-room-id'} initialPresence={{ cursor: null }}>
   <RoomProvider id={roomInfo?.id || 'default-room-id'} initialPresence={{ cursor: null }}>
    
      <div className={styles.container}>
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
        <div className={styles.reflexionContainer}>
          <button 
            onClick={() => setShowReflexion(!showReflexion)}
            className={styles.reflexionToggle}
          >
            {showReflexion ? 'Ocultar' : 'Mostrar'} tu reflexión
          </button>
          {showReflexion && reflexion && (
            <div className={styles.reflexionContent}>
              <h3>Tu reflexión anterior:</h3>
              <p>{reflexion}</p>
            </div>
          )}
        </div>
        <div className={styles.chatContainer}>
          <div className={styles.editorContainer}>
            <ClientSideSuspense fallback={<Loading />}>
              {() => children}
            </ClientSideSuspense>
          </div>
          
          <div className={styles.chatAreaWrapper}>
    <ChatArea 
              systemInstruction={CUSTOM_SYSTEM_INSTRUCTION} 
              userName={userName}
              //roomId={roomInfo.name || roomId}
              roomId={roomInfo?.name || 'default-room-name'}
            />
            </div>
          
          
        </div>
      </div>
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <p>Gracias por participar en esta actividad y ayudar al avance de la ciencia. Espera las instrucciones del profesor.</p>
            <button onClick={() => setShowPopup(false)}>Aceptar</button>
          </div>
        </div>
      )}
    
    
    
            </RoomProvider>
  );
}*/


//la mas nueva 31 mar
/*'use client';

import React, { ReactNode, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import styles from './pairPage.module.css';
import { Loading } from '@/components/Loading';
import ChatArea from '../chat/components/Chatarea';
import { SocketIOProvider } from '@/lib/SocketIOProvider';
import * as Y from 'yjs';

const CUSTOM_SYSTEM_INSTRUCTION =
  "Eres un asistente de investigación especializado en el impacto de las redes sociales en la sociedad. Ayuda a los estudiantes a reflexionar sobre los beneficios, desafíos y posibles soluciones relacionadas con las redes sociales, sin proporcionar respuestas directas. Fomenta el pensamiento crítico y la discusión.";

interface RoomProps {
  children: React.ReactElement<{ provider: SocketIOProvider; doc: Y.Doc }>;
}

export function Room({ children }: RoomProps) {
  const [timeRemaining, setTimeRemaining] = useState(900);
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [reflexion, setReflexion] = useState<string | null>(null);
  const [showReflexion, setShowReflexion] = useState(false);
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const finalizarSesionColaborativa = useCallback(async () => {
    if (sessionId) {
      try {
        await fetch('/api/finalizar-sesion-colaborativa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_sesion_colaborativa: sessionId })
        });
        console.log('Sesión colaborativa finalizada');
        setShowPopup(true);
        setTimeout(() => {
          router.push('/share');
        }, 3000);
      } catch (error) {
        console.error('Error al finalizar sesión colaborativa:', error);
      }
    } else {
      console.error('No se pudo finalizar sesión colaborativa. sessionId no existe');
      setTimeout(() => {
        router.push('/share');
      }, 3000);
    }
  }, [sessionId, router]);

  useEffect(() => {
    const userNameFromCookie = Cookies.get('studentUsername');
    const roomIdFromCookie = Cookies.get('roomId');
    const roomNameFromCookie = Cookies.get('roomName');

    if (userNameFromCookie) {
      setUserName(userNameFromCookie);
      localStorage.setItem('userName', userNameFromCookie);
    } else {
      setError('No se encontró nombre de usuario');
    }

    if (roomIdFromCookie) {
      setRoomId(roomIdFromCookie);
    } else {
      setError('No se encontró ID de sala');
    }

    if (roomNameFromCookie) {
      setRoomName(roomNameFromCookie);
    }

    if (userNameFromCookie && roomIdFromCookie) {
      const yDoc = new Y.Doc();
      try {
        const socketIOProvider = new SocketIOProvider(
          yDoc,
          roomIdFromCookie,
          userNameFromCookie,
          {
            name: userNameFromCookie,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16)
          }
        );

        setDoc(yDoc);
        setProvider(socketIOProvider);

        obtenerReflexion(userNameFromCookie);
        iniciarSesionColaborativa(roomIdFromCookie, roomNameFromCookie || 'Colaboración');
      } catch (error) {
        console.error('Error al inicializar componentes:', error);
        setError('Error al inicializar el entorno colaborativo');
      }
    }

    setLoading(false);
  }, []);

  const iniciarSesionColaborativa = async (id_room: string, tema: string) => {
    try {
      const response = await fetch('/api/iniciar-sesion-colaborativa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_room, tema })
      });
      const data = await response.json();
      setSessionId(data.id_sesion_colaborativa);
    } catch (error) {
      console.error('Error al iniciar sesión colaborativa:', error);
    }
  };

  const obtenerReflexion = async (alias: string) => {
    try {
      const response = await fetch(`/api/obtener-reflexion?alias=${encodeURIComponent(alias)}`);
      if (response.ok) {
        const data = await response.json();
        setReflexion(data.reflexion);
      } else if (response.status === 404) {
        console.log('No se encontró reflexión para este usuario');
        setReflexion(null);
      } else {
        console.error('Error al obtener la reflexión:', await response.text());
      }
    } catch (error) {
      console.error('Error al obtener la reflexión:', error);
    }
  };

  useEffect(() => {
    if (loading) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          console.log('¡Se acabó el tiempo!');
          finalizarSesionColaborativa();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (provider) provider.destroy();
      if (doc) doc.destroy();
    };
  }, [loading, provider, doc, finalizarSesionColaborativa]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const memoizedEditor = useMemo(() => {
    if (provider && doc) {
      return React.cloneElement(children, { provider, doc });
    }
    return null;
  }, [provider, doc, children]);

  if (loading) return <Loading />;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!userName || !roomId) return <div className={styles.error}>Falta información necesaria (nombre de usuario o ID de sala). Por favor, regrese a la página de actividades.</div>;
  if (!doc || !provider) return <div className={styles.loading}>Inicializando entorno colaborativo...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fase de Discusión en Parejas</h1>
      <p className={styles.timer}>Tiempo restante: {formatTime(timeRemaining)}</p>

      <div className={styles.instructionsContainer}>
        <h2 className={styles.subtitle}>Instrucciones del Editor Colaborativo</h2>
        <p className={styles.welcome}>¡Bienvenido al editor colaborativo, {userName}!</p>
        <ul className={styles.instructions}>
          <li>Discute y compara tus ideas con tu compañero sobre las redes sociales.</li>
          <li>Escriban juntos un resumen de sus ideas en el editor.</li>
          <li>Usen la barra de herramientas para formatear el texto.</li>
          <li>Respondan las tres preguntas de la fase individual.</li>
          <li>Logren una síntesis clara y colaborativa.</li>
        </ul>
        <p className={styles.encouragement}>¡Aprovecha esta oportunidad para aprender de tu compañero!</p>
      </div>

      <div className={styles.reflexionContainer}>
        <button onClick={() => setShowReflexion(!showReflexion)} className={styles.reflexionToggle}>
          {showReflexion ? 'Ocultar' : 'Mostrar'} tu reflexión
        </button>
        {showReflexion && reflexion && (
          <div className={styles.reflexionContent}>
            <h3>Tu reflexión anterior:</h3>
            <p>{reflexion}</p>
          </div>
        )}
      </div>

      <div className={styles.chatContainer}>
        <div className={styles.editorContainer}>{memoizedEditor}</div>

        <div className={styles.chatAreaWrapper}>
          <ChatArea systemInstruction={CUSTOM_SYSTEM_INSTRUCTION} userName={userName} roomId={roomId} />
        </div>
      </div>

      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <p>Gracias por participar en esta actividad y ayudar al avance de la ciencia. Espera las instrucciones del profesor.</p>
            <button onClick={() => setShowPopup(false)}>Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
}
  */
 'use client';

import React, { ReactNode, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import styles from './pairPage.module.css';
import { SocketIOProvider } from '@/lib/SocketIOProvider';
import * as Y from 'yjs';
import { Loading } from '@/components/Loading';
import ChatArea from "../chat/components/Chatarea";

interface RoomProps {
  children: React.ReactElement<{ provider: SocketIOProvider; doc: Y.Doc }>;
}

interface ActivityConfig {
  pair_phase_instructions: string;
  pair_phase_duration: number;
  activity_name: string;
  system_prompt: string;
}

export function Room({ children }: RoomProps) {
  const [timeRemaining, setTimeRemaining] = useState(900); // Default, will be updated from config
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [reflexion, setReflexion] = useState<string | null>(null);
  const [showReflexion, setShowReflexion] = useState(false);
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [activityConfig, setActivityConfig] = useState<ActivityConfig | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch activity configuration
  const fetchActivityConfiguration = async () => {
    try {
      const response = await fetch('/api/student/check-room-status');
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity configuration');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load activity data');
      }
      
      // Set the timer based on the configuration
      setTimeRemaining(data.room.pair_phase_duration);
      
      // Get the configuration from the response
      return {
        pair_phase_instructions: data.room.pair_phase_instructions,
        pair_phase_duration: data.room.pair_phase_duration,
        activity_name: data.room.activity_name,
        system_prompt: data.room.system_prompt
      };
    } catch (error) {
      console.error('Error fetching activity configuration:', error);
      return null;
    }
  };

  const finalizarSesionColaborativa = useCallback(async () => {
    if (sessionId) {
      try {
        await fetch('/api/finalizar-sesion-colaborativa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_sesion_colaborativa: sessionId })
        });
        console.log('Sesión colaborativa finalizada');
        
        // Show popup of thanks
        setShowPopup(true);
        
        // After showing the popup for a few seconds, redirect to the Share phase
        setTimeout(() => {
          router.push('/share');
        }, 3000);
      } catch (error) {
        console.error('Error al finalizar sesión colaborativa:', error);
      }
    }
    else {
      console.error('No se pudo finalizar sesión colaborativa. sessionId no existe');
      // Still try to redirect to the Share phase
      setTimeout(() => {
        router.push('/share');
      }, 3000);
    }
  }, [sessionId, router]);

  useEffect(() => {
    // Get data from cookies
    const userNameFromCookie = Cookies.get('studentUsername');
    const roomIdFromCookie = Cookies.get('roomId');
    const roomNameFromCookie = Cookies.get('roomName');
    
    if (userNameFromCookie) {
      setUserName(userNameFromCookie);
      localStorage.setItem('userName', userNameFromCookie);
    } else {
      setError('No se encontró nombre de usuario');
    }
    
    if (roomIdFromCookie) {
      setRoomId(roomIdFromCookie);
    } else {
      setError('No se encontró ID de sala');
    }
    
    if (roomNameFromCookie) {
      setRoomName(roomNameFromCookie);
    }
    
    // Initialize YJS and SocketIOProvider
    if (userNameFromCookie && roomIdFromCookie) {
      const yDoc = new Y.Doc();
      
      try {
        const socketIOProvider = new SocketIOProvider(
          yDoc,
          roomIdFromCookie,
          userNameFromCookie,
          {
            name: userNameFromCookie,
            color: '#' + Math.floor(Math.random()*16777215).toString(16)
          }
        );
        
        setDoc(yDoc);
        setProvider(socketIOProvider);
        
        obtenerReflexion(userNameFromCookie);
        iniciarSesionColaborativa(roomIdFromCookie, roomNameFromCookie || 'Colaboración');
        
        // Fetch activity configuration
        fetchActivityConfiguration().then(config => {
          if (config) {
            setActivityConfig(config);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error al inicializar componentes:', error);
        setError('Error al inicializar el entorno colaborativo');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
    
    return () => {
      // Cleanup 
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Initialize collaborative session
  const iniciarSesionColaborativa = async (id_room: string, tema: string) => {
    try {
      const response = await fetch('/api/iniciar-sesion-colaborativa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_room, tema })
      });
      const data = await response.json();
      setSessionId(data.id_sesion_colaborativa);
    } catch (error) {
      console.error('Error al iniciar sesión colaborativa:', error);
    }
  };

  const obtenerReflexion = async (alias: string) => {
    try {
      const response = await fetch(`/api/obtener-reflexion?alias=${encodeURIComponent(alias)}`);
      if (response.ok) {
        const data = await response.json();
        setReflexion(data.reflexion);
      } else if (response.status === 404) {
        console.log('No se encontró reflexión para este usuario');
        setReflexion(null);
      } else {
        console.error('Error al obtener la reflexión:', await response.text());
      }
    } catch (error) {
      console.error('Error al obtener la reflexión:', error);
    }
  };
  
  // Start timer
  useEffect(() => {
    if (loading) return;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          console.log('¡Se acabó el tiempo!');
          finalizarSesionColaborativa();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading, finalizarSesionColaborativa]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (loading) return <Loading />;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!userName || !roomId) return <div className={styles.error}>Faltan datos necesarios. Por favor, vuelve a iniciar el proceso.</div>;
  if (!doc || !provider) return <div className={styles.loading}>Inicializando entorno colaborativo...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fase de Discusión en Parejas</h1>
      <p className={styles.timer}>Tiempo restante: {formatTime(timeRemaining)}</p>
      
      <div className={styles.instructionsContainer}>
        <h2 className={styles.subtitle}>
          {activityConfig?.activity_name || 'Colaboración en Parejas'}
        </h2>
        <p className={styles.welcome}>
          ¡Bienvenido al editor colaborativo, {userName}!
        </p>
        <div className={styles.instructions}>
          {activityConfig?.pair_phase_instructions || 
           "En esta fase, trabajarás con un compañero para discutir y comparar sus ideas. Utiliza el editor de texto compartido para escribir un resumen conjunto de sus ideas y conclusiones."}
        </div>
        <p className={styles.encouragement}>
          ¡Aprovecha esta oportunidad para aprender de tu compañero y desarrollar una comprensión más profunda del tema!
        </p>
      </div>
      
      <div className={styles.reflexionContainer}>
        <button 
          onClick={() => setShowReflexion(!showReflexion)}
          className={styles.reflexionToggle}
        >
          {showReflexion ? 'Ocultar' : 'Mostrar'} tu reflexión
        </button>
        {showReflexion && reflexion && (
          <div className={styles.reflexionContent}>
            <h3>Tu reflexión anterior:</h3>
            <p>{reflexion}</p>
          </div>
        )}
      </div>
      
      <div className={styles.chatContainer}>
        <div className={styles.editorContainer}>
          {React.cloneElement(children, { provider, doc })}
        </div>
        
        <div className={styles.chatAreaWrapper}>
          <ChatArea 
            systemInstruction={activityConfig?.system_prompt || "Eres un asistente de colaboración que ayuda a los estudiantes a trabajar juntos en su actividad."} 
            userName={userName}
            roomId={roomId}
          />
        </div>
      </div>
      
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <p>Gracias por participar en esta actividad y ayudar al avance de la ciencia. Espera las instrucciones del profesor.</p>
            <button onClick={() => setShowPopup(false)}>Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
}