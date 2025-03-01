/*

'use client';
import { ReactNode, useState, useEffect } from 'react';
import { RoomProvider } from '@/liveblocks.config';
import { ClientSideSuspense } from '@liveblocks/react';
import { Loading } from '@/components/Loading';
import { useRouter, useSearchParams } from 'next/navigation';
import UseRoomId from './useRoomId';
import ChatArea from "../chat/components/Chatarea";

export function Room({ children }: { children: ReactNode }) {
  const [timeRemaining, setTimeRemaining] = useState(60);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const userName = searchParams.get('alias');

  useEffect(() => {
    const authenticateUser = async () => {

      console.log("namee "+userName);
      if (!userName) {
        setAuthError('Nombre de usuario no proporcionado');
        return;
      }
      else{

      try {
        console.log('Sending authentication request with userName:', userName);
        const response = await fetch('/api/liveblocks-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userName }),
        });
        console.log('Received response:', response);
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Authentication failed');
        }

        console.log('Authentication successful:', data);

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error durante la autenticación:', error);
        setAuthError(error instanceof Error ? error.message : 'Ocurrió un error durante la autenticación');
      }
    }
    };

    authenticateUser();
  }, [userName]);

  useEffect(() => {
    if (!isAuthenticated) return;

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
  }, [isAuthenticated]);

  const roomId = 'liveblocks:examples:nextjs-yjs-tiptap0000';
  const { RoomId, loading, error } = UseRoomId();

  if (loading) return <Loading />;
  if (error) return <div>Error: {(error as Error).message}</div>;
  if (authError) return <div>Error de autenticación: {authError}</div>;
  if (!isAuthenticated) return <Loading />;

  return (
    <RoomProvider id={RoomId || roomId} initialPresence={{ cursor: null }}>
      <div>
        <h1>Instrucciones del Editor Colaborativo</h1>
        <p>Tiempo restante: {timeRemaining} segundos</p>
        <p>
          ¡Bienvenido al editor colaborativo, {userName}! Aquí puedes trabajar junto con otros en tiempo real en un documento compartido.
          Escribe tu texto en el editor de abajo, y tus cambios serán visibles para todos en la sala.
        </p>
        
        <p>
          Puedes formatear tu texto usando la barra de herramientas en la parte superior del editor. ¡Diviértete colaborando!
        </p>
        <div className="chat-container">
          <ChatArea />
        </div>
      </div>
      <ClientSideSuspense fallback={<Loading />}>
        {() => children}
      </ClientSideSuspense>

      <style jsx>{`
        .chat-container {
          height: 80vh; 
          overflow-y: auto;
          margin-bottom: 20px;
        }
      `}</style>
    </RoomProvider>
  );
}*/

/*'use client';
import { ReactNode, useState, useEffect } from 'react';
import { RoomProvider } from '@/liveblocks.config';
import { ClientSideSuspense } from '@liveblocks/react';
import { Loading } from '@/components/Loading';
import { useRouter, useSearchParams } from 'next/navigation';
import UseRoomId from './useRoomId';
import ChatArea from "../chat/components/Chatarea";
import styles from './pairPage.module.css';

export function Room({ children }: { children: ReactNode }) {
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutos
  const router = useRouter();
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
    if (!isAuthenticated) return;

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
  }, [isAuthenticated]);

  const roomId = 'liveblocks:examples:nextjs-yjs-tiptap0000';
  const { RoomId, loading, error } = UseRoomId();

  if (loading) return <Loading />;
  if (error) return <div className={styles.error}>Error: {(error as Error).message}</div>;
  if (authError) return <div className={styles.error}>Error de autenticación: {authError}</div>;
  if (!isAuthenticated) return <Loading />;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <RoomProvider id={RoomId || roomId} initialPresence={{ cursor: null }}>
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
        <div className={styles.chatContainer}>
          <div className={styles.editorContainer}>
            <ClientSideSuspense fallback={<Loading />}>
              {() => children}
            </ClientSideSuspense>
          </div>
          <div className={styles.chatAreaWrapper}>
            <ChatArea />
          </div>
        </div>
      </div>
    </RoomProvider>
  );
}*/

/*
'use client';
import { ReactNode, useState, useEffect } from 'react';
import { RoomProvider } from '@/liveblocks.config';
import { ClientSideSuspense } from '@liveblocks/react';
import { Loading } from '@/components/Loading';
import { useRouter, useSearchParams } from 'next/navigation';
import UseRoomId from './UseRoomId';
import ChatArea from "../chat/components/Chatarea";
import styles from './pairPage.module.css';

//const CUSTOM_SYSTEM_INSTRUCTION = "Eres un asistente de investigación especializado en el impacto de las redes sociales en la sociedad. Ayuda a los estudiantes a reflexionar sobre los beneficios, desafíos y posibles soluciones relacionadas con las redes sociales, sin proporcionar respuestas directas. Fomenta el pensamiento crítico y la discusión.";
const CUSTOM_SYSTEM_INSTRUCTION = "Eres un gato. solo responderas como lo haría un gato";



export function Room({ children }: { children: ReactNode }) {
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutos
  const router = useRouter();
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
    if (!isAuthenticated) return;

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
  }, [isAuthenticated]);

  const roomId = 'liveblocks:examples:nextjs-yjs-tiptap0000';
  const { RoomId, loading, error } = UseRoomId();

  if (loading) return <Loading />;
  if (error) return <div className={styles.error}>Error: {(error as Error).message}</div>;
  if (authError) return <div className={styles.error}>Error de autenticación: {authError}</div>;
  if (!isAuthenticated) return <Loading />;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <RoomProvider id={RoomId || roomId} initialPresence={{ cursor: null }}>
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
        <div className={styles.chatContainer}>
          <div className={styles.editorContainer}>
            <ClientSideSuspense fallback={<Loading />}>
              {() => children}
            </ClientSideSuspense>
          </div>
          <div className={styles.chatAreaWrapper}>
            <ChatArea systemInstruction={CUSTOM_SYSTEM_INSTRUCTION} />
          </div>
        </div>
      </div>
    </RoomProvider>
  );
}
*/
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
}