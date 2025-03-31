// src/components/CollaborativeEditor.tsx nuevo
/*"use client";
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
       
      </div>
      <EditorContent editor={editor} className={styles.editorContainer} />
    </div>
  );
}
*/
/*"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { SocketIOProvider } from "@/lib/SocketIOProvider";
import { useEffect, useState, useCallback, useRef } from "react";
import { Toolbar } from "./Toolbar";
import styles from "./CollaborativeEditor.module.css";

const INTERACTION_SEND_INTERVAL = 5000; // 5 segundos
const CONTENT_CAPTURE_INTERVAL = 30000; // 30 segundos

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
    // Añadir al inicio de la función
    console.log("CollaborativeEditor renderizado con:", { 
      documentId, 
      userName, 
      roomName, 
      providerExists: !!provider, 
      docExists: !!doc 
    });
  const [sessionId, setSessionId] = useState<number | null>(null);
  const interactionsQueueRef = useRef<Array<{ tipo: string; detalles: any }>>([]);
  const lastCapturedContentRef = useRef('');
  const lastCaptureTimeRef = useRef(Date.now());
  const [editorReady, setEditorReady] = useState(false);

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
     
     // console.log('Inicializando doc y provider localmente');
      const yDoc = new Y.Doc();
      
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
        
        // Iniciar sesión colaborativa
        iniciarSesionColaborativa(documentId, roomName || 'Colaboración en Documento');
        
        return () => {
            console.log('Limpiando provider y doc');
          socketProvider?.destroy();
          yDoc?.destroy();
        };
      } catch (error) {
        console.error('Error al crear provider:', error);
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
    }
  };

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

  // Esperar a que todo esté listo antes de renderizar el editor
  useEffect(() => {
    if (actualDoc && actualProvider) {
        console.log('Doc y provider listos, configurando editor');
      setEditorReady(true);
    }
  }, [actualDoc, actualProvider]);

  if (!editorReady) {
    console.log('Editor no listo, mostrando carga...');
    return <div className={styles.loading}>Cargando editor colaborativo...</div>;
  }
  console.log('Renderizando TiptapEditor con:', {
    docAvailable: !!actualDoc,
    providerAvailable: !!actualProvider,
    userName
  });
  
  return (
    <TiptapEditor 
      doc={actualDoc!} 
      provider={actualProvider!} 
      userName={userName || 'Usuario anónimo'} 
      sessionId={sessionId}
      queueInteraction={queueInteraction}
      captureContent={captureContent}
    />
  );
}

type EditorProps = {
  doc: Y.Doc;
  provider: SocketIOProvider;
  userName: string;
  sessionId: number | null;
  queueInteraction: (tipo: string, detalles: any) => void;
  captureContent: (content: string, force?: boolean) => void;
};

function TiptapEditor({ doc, provider, userName, sessionId, queueInteraction, captureContent }: EditorProps) {
    console.log('TiptapEditor iniciado con:', { 
        docAvailable: !!doc, 
        providerAvailable: !!provider,
        userName, 
        sessionId 
      });
    
    const userInfo = {
    name: userName,
    color: '#' + Math.floor(Math.random()*16777215).toString(16),
    picture: 'https://liveblocks.io/avatars/avatar-1.png'
  };

  // Agregar awareness inicial para el usuario actual
  useEffect(() => {
    if (provider && provider.awareness) {
      try {
        console.log('Configurando awareness para:', userName);
        provider.awareness.setLocalStateField('user', userInfo);
      } catch (error) {
        console.error('Error al establecer estado local de awareness:', error);
      }
    }
  }, [provider, userInfo]);

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
      console.log('Editor actualizado, longitud del contenido:', content.length);
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
    if (editor) {
        console.log('TipTap editor inicializado correctamente');
      queueInteraction('usuario_unido', {
        id_usuario: userName,
        nombre_usuario: userName
      });
    }
    return () => {
        if (editor) {
            console.log('Limpiando TipTap editor');
          }
      queueInteraction('usuario_salido', {
        id_usuario: userName,
        nombre_usuario: userName
      });
    };
  }, [editor, userName, queueInteraction]);

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
"use client"
// src/components/CollaborativeEditor.tsx

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
      console.log('collaborative editor.tsx 👉 doc.toJSON()', yDoc.toJSON());
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
  }, [actualDoc, actualProvider]);

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
  
  /*console.log('Renderizando TiptapEditor con:', {
    docAvailable: !!actualDoc,
    providerAvailable: !!actualProvider,
    userName
  });*/
  
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
      
      <TiptapEditor 
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

/*function TiptapEditor({ doc, provider, userName, sessionId }: EditorProps) {
    useEffect(() => {
    console.log('TiptapEditor iniciado con:', { 
    docAvailable: !!doc, 
    providerAvailable: !!provider,
    userName, 
    sessionId 
  });
}, []);
    
  const userInfo = useMemo(() => ({
    name: userName,
    color: '#' + Math.floor(Math.random()*16777215).toString(16),
    picture: 'https://liveblocks.io/avatars/avatar-1.png'
  }), [userName]);

  // Agregar awareness inicial para el usuario actual
  useEffect(() => {
    if (provider && provider.awareness) {
      try {
        console.log('Configurando awareness para:', userName);
        provider.awareness.setLocalStateField('user', userInfo);
      } catch (error) {
        console.error('Error al establecer estado local de awareness:', error);
      }
    }
  }, [provider, userInfo, userName]);

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: styles.editor,
      },
      handleDOMEvents: {
        keydown: (view, event) => {
          // Registrar actividad de usuario
          return false; // Permitir que el evento continúe
        }
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      // Capturar contenido actualizado para el servidor
      if (sessionId) {
        // Enviamos el contenido actualizado periódicamente
      }
      console.log('Editor actualizado, longitud del contenido:', content.length);
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
function TiptapEditor({ doc, provider, userName, sessionId }: EditorProps) {
    useEffect(() => {
      console.log('TiptapEditor iniciado con:', { 
        docAvailable: !!doc, 
        providerAvailable: !!provider,
        userName, 
        sessionId 
      });
  
      // Verifica el tipo antes de continuar
      const tipo = doc.get('default');
      console.log('🔍 Tipo del fragmento recibido en editor:', tipo.constructor.name);
    }, [doc, provider, userName, sessionId]);
  
    const userInfo = useMemo(() => ({
      name: userName,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      picture: 'https://liveblocks.io/avatars/avatar-1.png'
    }), [userName]);
  
    const xmlFragment = useMemo(() => doc.getXmlFragment('default'), [doc]); // 👈 AQUÍ EL CAMBIO
  
    const editor = useEditor({
      editorProps: {
        attributes: {
          class: styles.editor,
        },
      },
      onUpdate: ({ editor }) => {
        const content = editor.getHTML();
        console.log('Editor actualizado, longitud del contenido:', content.length);
      },
      extensions: [
        StarterKit.configure({
          history: false,
        }),
        Collaboration.configure({
          document: xmlFragment, // 👈 AQUÍ EL CAMBIO
        }),
        CollaborationCursor.configure({
          provider: provider,
          user: userInfo,
        }),
      ],
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
  }