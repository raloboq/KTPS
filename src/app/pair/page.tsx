/*
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
}*/
'use client';

import { Room } from "@/app/pair/Room";
import { CollaborativeEditor } from "@/components/CollaborativeEditor";
import Cookies from 'js-cookie';
import { Suspense, useMemo } from 'react';

// Componente de carga para Suspense
function Loading() {
  return <div>Cargando...</div>;
}

// Componente interno que usa cookies
function PairPageContent() {
  const documentId = Cookies.get('roomId') || '';
  const userName = Cookies.get('studentUsername') || '';
  const roomName = Cookies.get('roomName') || '';
  
  if (!documentId || !userName) {
    return <div>Error: Faltan datos necesarios. Por favor, vuelve a iniciar el proceso.</div>;
  }

 // ✅ Memoiza el componente editor para evitar recreaciones
 const memoizedEditor = useMemo(() => (
  <CollaborativeEditor 
    documentId={documentId} 
    userName={userName} 
    roomName={roomName} 
  />
), [documentId, userName, roomName]);

return (
  <Room>
    {memoizedEditor}
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