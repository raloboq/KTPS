/*import { Room } from "@/app/pair/Room";

import { CollaborativeEditor } from "@/components/CollaborativeEditor";


export default function Home() {
  return (
    <main>
      <Room>
        <CollaborativeEditor />
      </Room>
    </main>
  );
}*/
'use client';

import { Room } from "@/app/pair/Room";
import { CollaborativeEditor } from "@/components/CollaborativeEditor"; // Asegúrate de que la ruta sea correcta
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('roomId') || 'default-room-id';
  const userName = searchParams.get('alias') || 'Usuario Anónimo';
  const roomName = searchParams.get('roomName') || 'Sala Default';

  return (
    <main>
      <Room>
        <CollaborativeEditor 
          documentId={documentId} 
          userName={userName} 
          roomName={roomName} 
        />
      </Room>
    </main>
  );
}
