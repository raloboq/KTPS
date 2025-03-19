// src/components/CollaborativeEditor.tsx nuevo
"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { useEffect, useState, useCallback, useRef } from "react";
import { SocketIOProvider } from "@/lib/SocketIOProvider";
import { Toolbar } from "./Toolbar";
import styles from "./CollaborativeEditor.module.css";
import { Avatars } from "./Avatars";

const INTERACTION_SEND_INTERVAL = 5000; // 5 segundos
const CONTENT_CAPTURE_INTERVAL = 30000; // 30 segundos

export function CollaborativeEditor({ 
    documentId, 
    userName, 
    roomName 
  }: { 
    documentId: string; 
    userName: string; 
    roomName?: string;  // El signo ? indica que es opcional
  }) {
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const interactionsQueueRef = useRef<Array<{ tipo: string; detalles: any }>>([]);
  
  // Inicializar YJS y Socket.io provider
  useEffect(() => {
    const yDoc = new Y.Doc();
    
    const socketProvider = new SocketIOProvider(
      yDoc,
      documentId,
      userName,
      {
        name: userName,
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      }
    );
    
    setDoc(yDoc);
    setProvider(socketProvider);
    
    // Iniciar sesión colaborativa mediante API
    const initSession = async () => {
      try {
        const response = await fetch('/api/iniciar-sesion-colaborativa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id_room: documentId, 
            tema: roomName || 'Colaboración en documento'
          })
        });
        const data = await response.json();
        setSessionId(data.id_sesion_colaborativa);
      } catch (error) {
        console.error('Error al iniciar sesión colaborativa:', error);
      }
    };
    
    initSession();
    
    // Limpieza
    return () => {
      socketProvider.destroy();
      yDoc.destroy();
      
      // Finalizar sesión si existe
      if (sessionId) {
        fetch('/api/finalizar-sesion-colaborativa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_sesion_colaborativa: sessionId })
        }).catch(err => console.error('Error finalizando sesión:', err));
      }
    };
  }, [documentId, userName, roomName]);

  const queueInteraction = useCallback((tipo: string, detalles: any) => {
    interactionsQueueRef.current.push({ tipo, detalles });
  }, []);
  
  const sendInteractions = useCallback(async () => {
    if (sessionId && interactionsQueueRef.current.length > 0) {
      const interactionsToSend = [...interactionsQueueRef.current];
      interactionsQueueRef.current = [];

      try {
        await fetch('/api/registrar-interacciones-colaborativas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_sesion_colaborativa: sessionId,
            interacciones: interactionsToSend
          })
        });
      } catch (error) {
        console.error('Error al enviar interacciones:', error);
        interactionsQueueRef.current.push(...interactionsToSend);
      }
    }
  }, [sessionId]);

  useEffect(() => {
    const intervalId = setInterval(sendInteractions, INTERACTION_SEND_INTERVAL);
    return () => clearInterval(intervalId);
  }, [sendInteractions]);
  
  if (!doc || !provider) {
    return <div className={styles.loading}>Cargando editor colaborativo...</div>;
  }
  
  return (
    <TiptapEditor 
      doc={doc} 
      provider={provider} 
      userName={userName} 
      sessionId={sessionId}
      queueInteraction={queueInteraction}
    />
  );
}

type EditorProps = {
  doc: Y.Doc;
  provider: SocketIOProvider;
  userName: string;
  sessionId: number | null;
  queueInteraction: (tipo: string, detalles: any) => void;
};

function TiptapEditor({ doc, provider, userName, sessionId, queueInteraction }: EditorProps) {
  const lastCapturedContentRef = useRef('');
  const lastCaptureTimeRef = useRef(Date.now());

  const captureContent = useCallback((content: string, force: boolean = false) => {
    if (!sessionId) return;
    
    const currentTime = Date.now();
    if (force || currentTime - lastCaptureTimeRef.current >= CONTENT_CAPTURE_INTERVAL) {
      if (content !== lastCapturedContentRef.current) {
        fetch('/api/capturar-contenido-colaborativo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_sesion_colaborativa: sessionId,
            contenido: content
          })
        }).catch(error => console.error('Error al capturar contenido:', error));

        lastCapturedContentRef.current = content;
        lastCaptureTimeRef.current = currentTime;
      }
    }
  }, [sessionId]);

  const userInfo = {
    name: userName,
    color: '#' + Math.floor(Math.random()*16777215).toString(16),
    picture: 'https://liveblocks.io/avatars/avatar-1.png'
  };

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: styles.editor,
      },
      handleDOMEvents: {
        keydown: (view, event) => {
          queueInteraction('keypress', {
            key: event.key,
            timestamp: Date.now()
          });
        }
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      captureContent(content);
      queueInteraction('contenido_actualizado', {
        longitud: content.length,
        timestamp: Date.now()
      });
    },
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: doc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: userInfo,
      }),
    ],
  });

  useEffect(() => {
    if (editor && userName) {
      queueInteraction('usuario_unido', {
        id_usuario: userName,
        nombre_usuario: userName
      });
    }
    return () => {
      if (userName) {
        queueInteraction('usuario_salido', {
          id_usuario: userName,
          nombre_usuario: userName
        });
      }
    };
  }, [editor, userName, queueInteraction]);

  return (
    <div className={styles.container}>
      <div className={styles.editorHeader}>
        <Toolbar editor={editor} />
        {/* Necesitarás implementar una nueva versión de Avatars que no use liveblocks */}
        {/* <Avatars /> */}
      </div>
      <EditorContent editor={editor} className={styles.editorContainer} />
    </div>
  );
}