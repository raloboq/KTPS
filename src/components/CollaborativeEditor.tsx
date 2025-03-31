// src/components/CollaborativeEditor.tsx
/*
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { SocketIOProvider } from "@/lib/SocketIOProvider";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Toolbar } from "./Toolbar";
import styles from "./CollaborativeEditor.module.css";
import ConnectionStatus from "./ConnectionStatus";

export function CollaborativeEditor({ 
  documentId, 
  userName, 
  roomName,
  provider,
  doc
}: { 
  documentId?: string; 
  userName?: string; 
  roomName?: string;
  provider?: SocketIOProvider;
  doc?: Y.Doc;
}) {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showReconnectMessage, setShowReconnectMessage] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Si no se pasan provider y doc como props, crear instancias locales
  const [localDoc, setLocalDoc] = useState<Y.Doc | null>(null);
  const [localProvider, setLocalProvider] = useState<SocketIOProvider | null>(null);
  
  // Determinar qué provider y doc usar (props o locales)
  const actualDoc = doc || localDoc;
  const actualProvider = provider || localProvider;

  // Inicializar YJS y Socket.io provider si no se proporcionan como props
  useEffect(() => {
    if (!provider && !doc && documentId && userName) {
      console.log('Inicializando doc y provider localmente para:', documentId, userName);
      const yDoc = new Y.Doc();
      
      // Inicializar explícitamente el fragmento XML
      const xmlFragment = yDoc.getXmlFragment('default');
      console.log('Fragmento XML inicializado explícitamente:', xmlFragment);
      
      try {
        const socketProvider = new SocketIOProvider(
          yDoc,
          documentId,
          userName,
          {
            name: userName,
            color: '#' + Math.floor(Math.random()*16777215).toString(16),
            picture: 'https://liveblocks.io/avatars/avatar-1.png'
          }
        );
        console.log('Provider creado correctamente:', socketProvider);
        setLocalDoc(yDoc);
        setLocalProvider(socketProvider);
        
        // Configurar listeners para el estado de conexión
        socketProvider.on('status', (status: { connected: boolean, reason?: string }) => {
          setConnectionStatus(status.connected ? 'connected' : 'disconnected');
          
          if (!status.connected) {
            setErrorMessage(`Desconectado: ${status.reason || 'Error de conexión'}`);
            
            // Si estamos desconectados por más de 10 segundos, mostrar mensaje de reconexión
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
            
            reconnectTimeoutRef.current = setTimeout(() => {
              setShowReconnectMessage(true);
            }, 10000);
          } else {
            setErrorMessage(null);
            setShowReconnectMessage(false);
            
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
              reconnectTimeoutRef.current = null;
            }
          }
        });
        
        socketProvider.on('error', (error: { message: string }) => {
          setErrorMessage(error.message);
          
          // Si el error persiste por 5 segundos, mostrar mensaje de reconexión
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setShowReconnectMessage(true);
          }, 5000);
        });
        
        // Iniciar sesión colaborativa
        iniciarSesionColaborativa(documentId, roomName || 'Colaboración en Documento');
        
        return () => {
          console.log('Limpiando provider y doc');
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          socketProvider?.destroy();
          yDoc?.destroy();
        };
      } catch (error) {
        console.error('Error al crear provider:', error);
        setErrorMessage('Error al inicializar el editor colaborativo');
      }
    }
  }, [documentId, userName, roomName, provider, doc]);

  // Iniciar sesión colaborativa mediante API
  const iniciarSesionColaborativa = async (id_room: string, tema: string) => {
    console.log('Intentando iniciar sesión colaborativa:', id_room, tema);
    try {
      const response = await fetch('/api/iniciar-sesion-colaborativa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_room, tema })
      });
      const data = await response.json();
      console.log('Sesión colaborativa iniciada:', data);
      setSessionId(data.id_sesion_colaborativa);
    } catch (error) {
      console.error('Error al iniciar sesión colaborativa:', error);
      setErrorMessage('Error al iniciar sesión colaborativa');
    }
  };

  // Función para forzar una reconexión
  const handleReconnect = useCallback(() => {
    console.log('Forzando reconexión manual');
    if (actualProvider && typeof actualProvider.reconnect === 'function') {
      actualProvider.reconnect();
      setShowReconnectMessage(false);
      setErrorMessage('Intentando reconexión...');
      
      // Limpiar el mensaje de reconexión después de 3 segundos
      setTimeout(() => {
        if (errorMessage === 'Intentando reconexión...') {
          setErrorMessage(null);
        }
      }, 3000);
    } else {
      // Si no podemos reconectar, sugerir recargar la página
      setErrorMessage('No se pudo reconectar. Intenta recargar la página.');
    }
  }, [actualProvider, errorMessage]);

  // Esperar a que todo esté listo antes de renderizar el editor
  useEffect(() => {
    if (!editorReady && actualDoc && actualProvider) {
      console.log('Doc y provider listos, configurando editor');
      setEditorReady(true);
    }
  }, [actualDoc, actualProvider, editorReady]);

  // Limpiar timeouts al desmontar el componente
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  if (!editorReady) {
    console.log('Editor no listo, mostrando carga...');
    return <div className={styles.loading}>Cargando editor colaborativo...</div>;
  }
  
  return (
    <>
      {errorMessage && (
        <ConnectionStatus 
          connected={connectionStatus === 'connected'}
          errorMessage={errorMessage}
          showReconnect={showReconnectMessage}
          onReconnect={handleReconnect}
        />
      )}
      
      <SimpleTiptapEditor 
        doc={actualDoc!} 
        provider={actualProvider!} 
        userName={userName || 'Usuario anónimo'} 
        sessionId={sessionId}
      />
    </>
  );
}

type EditorProps = {
    doc: Y.Doc;
    provider: SocketIOProvider;
    userName: string;
    sessionId: number | null;
};

function SimpleTiptapEditor({ doc, provider, userName, sessionId }: EditorProps) {
  useEffect(() => {
    console.log('SimpleTiptapEditor iniciado con:', { 
      docAvailable: !!doc, 
      providerAvailable: !!provider,
      userName, 
      sessionId 
    });
  }, [doc, provider, userName, sessionId]);
  
  const userInfo = useMemo(() => ({
    name: userName,
    color: '#' + Math.floor(Math.random()*16777215).toString(16),
    picture: 'https://liveblocks.io/avatars/avatar-1.png'
  }), [userName]);
  
  // IMPORTANTE: Crear el documento de texto directamente en vez de usar XML Fragment
  const ydoc = useMemo(() => {
    return doc;
  }, [doc]);
  
  // Crear un fragmento XML explícitamente
  const ytext = useMemo(() => {
    // Acceder directamente al tipo 'text' en lugar de 'xmlFragment'
    return doc.getText('default');
  }, [doc]);

  // Usar una configuración simplificada para el editor
  const editor = useEditor({
    editorProps: {
      attributes: {
        class: styles.editor,
      },
    },
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      // Usar el tipo Text en lugar de XmlFragment para la colaboración
      Collaboration.configure({
        document: ydoc,
        field: 'default',
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: userInfo,
      }),
    ],
    content: '<p>Escribe aquí tu colaboración...</p>',
  });

  return (
    <div className={styles.container}>
      <div className={styles.editorHeader}>
        <Toolbar editor={editor} />
        <div className={styles.statusIndicator}>
          <span className={styles.statusDot}></span>
          Colaborativo
        </div>
      </div>
      <EditorContent editor={editor} className={styles.editorContainer} />
    </div>
  );
}*/

// src/components/CollaborativeEditor.tsx

"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { SocketIOProvider } from "@/lib/SocketIOProvider";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Toolbar } from "./Toolbar";
import styles from "./CollaborativeEditor.module.css";
import ConnectionStatus from "./ConnectionStatus";

export function CollaborativeEditor({ 
  documentId, 
  userName, 
  roomName,
  provider,
  doc
}: { 
  documentId?: string; 
  userName?: string; 
  roomName?: string;
  provider?: SocketIOProvider;
  doc?: Y.Doc;
}) {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showReconnectMessage, setShowReconnectMessage] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [localDoc, setLocalDoc] = useState<Y.Doc | null>(null);
  const [localProvider, setLocalProvider] = useState<SocketIOProvider | null>(null);

  const actualDoc = doc || localDoc;
  const actualProvider = provider || localProvider;

  useEffect(() => {
    if (!provider && !doc && documentId && userName) {
      const yDoc = new Y.Doc();
      const xmlFragment = yDoc.getXmlFragment("default");
      const xmlText = new Y.XmlText();
      xmlText.insert(0, "Documento colaborativo nuevo");
      xmlFragment.insert(0, [xmlText]);

      const socketProvider = new SocketIOProvider(
        yDoc,
        documentId,
        userName,
        {
          name: userName,
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
          picture: 'https://liveblocks.io/avatars/avatar-1.png'
        }
      );

      setLocalDoc(yDoc);
      setLocalProvider(socketProvider);

      socketProvider.on('status', (status: { connected: boolean, reason?: string }) => {
        setConnectionStatus(status.connected ? 'connected' : 'disconnected');
        if (!status.connected) {
          setErrorMessage(`Desconectado: ${status.reason || 'Error de conexión'}`);
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => setShowReconnectMessage(true), 10000);
        } else {
          setErrorMessage(null);
          setShowReconnectMessage(false);
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        }
      });

      socketProvider.on('error', (error: { message: string }) => {
        setErrorMessage(error.message);
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => setShowReconnectMessage(true), 5000);
      });

      iniciarSesionColaborativa(documentId, roomName || 'Colaboración en Documento');

      return () => {
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        socketProvider.destroy();
        yDoc.destroy();
      };
    }
  }, [documentId, userName, roomName, provider, doc]);

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
      setErrorMessage('Error al iniciar sesión colaborativa');
    }
  };

  const handleReconnect = useCallback(() => {
    if (actualProvider && typeof actualProvider.reconnect === 'function') {
      actualProvider.reconnect();
      setShowReconnectMessage(false);
      setErrorMessage('Intentando reconexión...');
      setTimeout(() => {
        if (errorMessage === 'Intentando reconexión...') setErrorMessage(null);
      }, 3000);
    } else {
      setErrorMessage('No se pudo reconectar. Intenta recargar la página.');
    }
  }, [actualProvider, errorMessage]);

  useEffect(() => {
    if (!editorReady && actualDoc && actualProvider) {
      setEditorReady(true);
    }
  }, [actualDoc, actualProvider, editorReady]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  if (!editorReady) return <div className={styles.loading}>Cargando editor colaborativo...</div>;

  return (
    <>
      {errorMessage && (
        <ConnectionStatus 
          connected={connectionStatus === 'connected'}
          errorMessage={errorMessage}
          showReconnect={showReconnectMessage}
          onReconnect={handleReconnect}
        />
      )}
      <XmlTiptapEditor 
        doc={actualDoc!} 
        provider={actualProvider!} 
        userName={userName || 'Usuario anónimo'} 
        sessionId={sessionId} 
      />
    </>
  );
}

type EditorProps = {
  doc: Y.Doc;
  provider: SocketIOProvider;
  userName: string;
  sessionId: number | null;
};

function XmlTiptapEditor({ doc, provider, userName, sessionId }: EditorProps) {
    
  const userInfo = useMemo(() => ({
    name: userName,
    color: '#' + Math.floor(Math.random()*16777215).toString(16),
    picture: 'https://liveblocks.io/avatars/avatar-1.png'
  }), [userName]);

  const fragment = useMemo(() => {
    const xml = doc.getXmlFragment('default');
    console.log('✅ Fragmento XML recuperado:', xml);
    return xml;
  }, [doc]);

  /*const editor = useEditor({
    editorProps: {
      attributes: {
        class: styles.editor,
      },
    },
    extensions: [
      StarterKit.configure({ history: false }),
      Collaboration.configure({ document: fragment }),
      CollaborationCursor.configure({ provider, user: userInfo }),
    ],
  });*/

  // 🧪 Agrega este bloque para debug
  useEffect(() => {
    const handler = (update: Uint8Array, origin: any) => {
      console.log('🧪 DEBUG DIRECTO: update en doc. Origin:', origin);
    };
    doc.on('update', handler);
    return () => {
      doc.off('update', handler);
    };
  }, [doc]);

  useEffect(() => {
    if (doc) {
      const fragment = doc.getXmlFragment('default');
      const xmlText = new Y.XmlText();
      xmlText.insert(0, 'Prueba de contenido');
      fragment.insert(0, [xmlText]);
      console.log('🌟 Fragmento escrito manualmente');
    }
  }, [doc]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Collaboration.configure({
        document: doc, // ✅ PASA EL Y.Doc, no XmlFragment
        field: 'default', // ✅ para que use getXmlFragment('default')
      }),
      CollaborationCursor.configure({
        provider,
        user: userInfo,
      }),
    ],
    editorProps: { attributes: { class: styles.editor } },
  });

  console.log('🧪 Tiptap editor creado:', editor);
  console.log('🧠 Editor montado:', editor?.getJSON());
console.log('📍 Awareness:', provider?.awareness?.getLocalState());

  

  return (
    <div className={styles.container}>
      <div className={styles.editorHeader}>
        <Toolbar editor={editor} />
        <div className={styles.statusIndicator}>
          <span className={styles.statusDot}></span>
          Colaborativo
        </div>
      </div>
      <EditorContent editor={editor} className={styles.editorContainer} />
    </div>
  );
}
