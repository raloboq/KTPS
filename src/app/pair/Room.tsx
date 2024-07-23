/*'use client';
import { ReactNode, useMemo, useState, useEffect, Suspense } from 'react';
import { RoomProvider } from '@/liveblocks.config';
import { useSearchParams } from 'next/navigation';
import { ClientSideSuspense } from '@liveblocks/react';
import { Loading } from '@/components/Loading';
import { useRouter } from 'next/navigation';
//import { getExampleRoomId } from '@/lib/getExampleRoomId';
import UseRoomId from './UseRoomId';

export function Room({ children }: { children: ReactNode }) {
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
      // Perform any actions when time runs out
      console.log('Time is up!');
    }
  }, [timeRemaining]);

  const roomId = 'liveblocks:examples:nextjs-yjs-tiptap0000';
  const { RoomId, loading, error } = UseRoomId(roomId);
  //console.log("front room"+RoomId);

  if (loading) return <Loading />;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <RoomProvider id={RoomId || roomId} initialPresence={{ cursor: null }}>
      <div>
        <h1>Collaborative Editor Instructions</h1>
        <p>Time Remaining: {timeRemaining} seconds</p>
        <p>
          Welcome to the collaborative editor! Here, you can work together with others in real-time on a shared document. Type your text in the editor below, and your changes will be visible to everyone in the room.
        </p>
        <p>
          You can format your text using the toolbar at the top of the editor. Have fun collaborating!
        </p>
      </div>
      <ClientSideSuspense fallback={<Loading />}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
    
  );
}*/

'use client';
import { ReactNode, useState, useEffect } from 'react';
import { RoomProvider } from '@/liveblocks.config';
import { ClientSideSuspense } from '@liveblocks/react';
import { Loading } from '@/components/Loading';
import { useRouter, useSearchParams } from 'next/navigation';
import UseRoomId from './useRoomId';

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
      </div>
      <ClientSideSuspense fallback={<Loading />}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
