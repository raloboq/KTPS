import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { SocketIOProvider } from '@/lib/SocketIOProvider';
import * as Y from 'yjs';

type SessionInfo = {
  userName: string | null;
  roomId: string | null;
  roomName: string | null;
  doc: Y.Doc | null;
  provider: SocketIOProvider | null;
  sessionId: number | null;
  reflexion: string | null;
  loading: boolean;
  error: string | null;
};

export function useColabSession(): SessionInfo {
  const [userName, setUserName] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [reflexion, setReflexion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userNameFromCookie = Cookies.get('studentUsername');
    const roomIdFromCookie = Cookies.get('roomId');
    const roomNameFromCookie = Cookies.get('roomName');

    if (!userNameFromCookie || !roomIdFromCookie) {
      setError('Faltan cookies de identificación');
      setLoading(false);
      return;
    }

    setUserName(userNameFromCookie);
    setRoomId(roomIdFromCookie);
    setRoomName(roomNameFromCookie || 'Colaboración');
    localStorage.setItem('userName', userNameFromCookie);

    const yDoc = new Y.Doc();
    const provider = new SocketIOProvider(
      yDoc,
      roomIdFromCookie,
      userNameFromCookie,
      {
        name: userNameFromCookie,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      }
    );

    setDoc(yDoc);
    setProvider(provider);

    iniciarSesionColaborativa(roomIdFromCookie, roomNameFromCookie || 'Colaboración');
    obtenerReflexion(userNameFromCookie);

    setLoading(false);

    return () => {
      provider.destroy();
      yDoc.destroy();
    };
  }, []);

  const iniciarSesionColaborativa = async (id_room: string, tema: string) => {
    try {
      const response = await fetch('/api/iniciar-sesion-colaborativa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_room, tema }),
      });
      const data = await response.json();
      setSessionId(data.id_sesion_colaborativa);
    } catch (err) {
      console.error('Error iniciando sesión colaborativa:', err);
    }
  };

  const obtenerReflexion = async (alias: string) => {
    try {
      const response = await fetch(`/api/obtener-reflexion?alias=${encodeURIComponent(alias)}`);
      if (response.ok) {
        const data = await response.json();
        setReflexion(data.reflexion);
      } else {
        console.log('No se encontró reflexión');
      }
    } catch (err) {
      console.error('Error obteniendo reflexión:', err);
    }
  };

  return {
    userName,
    roomId,
    roomName,
    doc,
    provider,
    sessionId,
    reflexion,
    loading,
    error,
  };
}