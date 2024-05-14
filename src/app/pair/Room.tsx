/*'use client';

import { ReactNode, useMemo, useState, useEffect } from 'react';
import { RoomProvider } from '@/liveblocks.config';
import { useSearchParams } from 'next/navigation';
import { ClientSideSuspense } from '@liveblocks/react';
import { Loading } from '@/components/Loading';
import { useRouter } from 'next/navigation';

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

  const roomId = useExampleRoomId('liveblocks:examples:nextjs-yjs-tiptap');
  console.log(roomId);

  return (
    <RoomProvider id={roomId} initialPresence={{ cursor: null }}>
      <div>
        <h1>Collaborative Editor Instructions</h1>
        <p>Time Remaining: {timeRemaining} seconds</p>
        <p>
          Welcome to the collaborative editor! Here, you can work together with
          others in real-time on a shared document. Type your text in the editor
          below, and your changes will be visible to everyone in the room.
        </p>
        <p>
          You can format your text using the toolbar at the top of the editor.
          Have fun collaborating!
        </p>
      </div>
      <ClientSideSuspense fallback={<Loading />}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}


function useExampleRoomId(roomId: string) {
  const params = useSearchParams();
  const exampleId = params?.get('exampleId');
  const exampleRoomId = useMemo(() => {
    return exampleId ? `${roomId}-${exampleId}` : roomId;
  }, [roomId, exampleId]);
  return exampleRoomId;
}
*/
'use client';
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

  const roomId = 'liveblocks:examples:nextjs-yjs-tiptap';
  const { RoomId, loading, error } = UseRoomId(roomId);

  if (loading) return <Loading />;
  if (error) return <div>Error: {(error as Error).message}</div>;

  /*const exampleRoomId = useMemo(async () => {
    try {
      return await getExampleRoomId();
    } catch (error) {
      console.error('Error fetching example room ID:', error);
      return roomId;
    }
  }, [roomId]);

  console.log(exampleRoomId);*/
  

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
}
