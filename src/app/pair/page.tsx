/*'use client';

import { Room } from "@/app/pair/Room";
import { CollaborativeEditor } from "@/components/CollaborativeEditor";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Componente de carga para Suspense
function Loading() {
  return <div>Cargando...</div>;
}

// Componente interno que usa useSearchParams
function PairPageContent() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('roomId') || 'default-room-id';
  const userName = searchParams.get('alias') || 'Usuario Anónimo';
  const roomName = searchParams.get('roomName') || 'Sala Default';

  return (
    <Room>
      <CollaborativeEditor 
        documentId={documentId} 
        userName={userName} 
        roomName={roomName} 
      />
    </Room>
  );
}

// Componente principal envuelto en Suspense
export default function PairPage() {
  return (
    <main>
      <Suspense fallback={<Loading />}>
        <PairPageContent />
      </Suspense>
    </main>
  );
}
  */
 'use client';

import { Room } from "@/app/pair/Room";
import { CollaborativeEditor } from "@/components/CollaborativeEditor";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Componente de carga para Suspense
function Loading() {
  return <div>Cargando...</div>;
}

// Componente interno que usa useSearchParams
function PairPageContent() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('roomId') || '';
  const userName = searchParams.get('alias') || '';
  const roomName = searchParams.get('roomName') || '';
  
  if (!documentId || !userName) {
    return <div>Error: Faltan parámetros necesarios (roomId o alias)</div>;
  }

  return (
    <Room>
      <CollaborativeEditor 
        documentId={documentId} 
        userName={userName} 
        roomName={roomName} 
      />
    </Room>
  );
}

// Componente principal envuelto en Suspense
export default function PairPage() {
  return (
    <main>
      <Suspense fallback={<Loading />}>
        <PairPageContent />
      </Suspense>
    </main>
  );
}