/*"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import LiveblocksProvider from "@liveblocks/yjs";
import { useRoom, useSelf } from "@/liveblocks.config";
import { useEffect, useState } from "react";
import { Toolbar } from "./Toolbar";
import styles from "./CollaborativeEditor.module.css";
import { Avatars } from "@/components/Avatars";

// Collaborative text editor with simple rich text, live cursors, and live avatars

export function CollaborativeEditor() {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<any>();

  // Set up Liveblocks Yjs provider
  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksProvider(room, yDoc);
    setDoc(yDoc);
    setProvider(yProvider);

    return () => {
      yDoc?.destroy();
      yProvider?.destroy();
    };
  }, [room]);

  if (!doc || !provider) {
    return null;
  }

  return <TiptapEditor doc={doc} provider={provider} />;
}

type EditorProps = {
  doc: Y.Doc;
  provider: any;
};

function TiptapEditor({ doc, provider }: EditorProps) {
  // Get user info from Liveblocks authentication endpoint
  const userInfo = useSelf((me) => me.info);
  const room = useRoom();
  // Set up editor with plugins, and place user info into Yjs awareness and cursors
  const editor = useEditor({
    editorProps: {
      attributes: {
        // Add styles to editor element
        class: styles.editor,
      },
      handleDOMEvents: { 
        keydown: (view, event) => {
          var timestamp = Number(new Date());
          //console.log(room.id)
          //console.log(event.key)
          //console.log(timestamp)
          console.log(userInfo)
      
        }
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      //console.log(json)
      
      // send the content to an API here
    },
    extensions: [
      StarterKit.configure({
        // The Collaboration extension comes with its own history handling
        history: false,
      }),
      // Register the document with Tiptap
      Collaboration.configure({
        document: doc,
      }),
      // Attach provider and user info
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
        <Avatars />
      </div>
      <EditorContent editor={editor} className={styles.editorContainer} />
    </div>
  );
}*/
//version 23 septiembre que tiene problemas en ocaciones con usuario anonymous
/*"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import LiveblocksProvider from "@liveblocks/yjs";
import { useRoom, useSelf } from "@/liveblocks.config";
import { useEffect, useState, useCallback, useRef } from "react";
import { Toolbar } from "./Toolbar";
import styles from "./CollaborativeEditor.module.css";
import { Avatars } from "@/components/Avatars";

const INTERACTION_SEND_INTERVAL = 5000; // 5 segundos
const CONTENT_CAPTURE_INTERVAL = 30000; // 30 segundos

export function CollaborativeEditor() {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<any>();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const interactionsQueueRef = useRef<Array<{ tipo: string; detalles: any }>>([]);

  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksProvider(room, yDoc);
    setDoc(yDoc);
    setProvider(yProvider);

    // Iniciar sesión colaborativa
    iniciarSesionColaborativa(room.id);

    return () => {
      yDoc?.destroy();
      yProvider?.destroy();
      finalizarSesionColaborativa();
    };
  }, [room]);

  const iniciarSesionColaborativa = async (roomId: string) => {
    try {
      const response = await fetch('/api/iniciar-sesion-colaborativa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_room: roomId, tema: 'Colaboración en Influencia de Redes Sociales' })
      });
      const data = await response.json();
      setSessionId(data.id_sesion_colaborativa);
    } catch (error) {
      console.error('Error al iniciar sesión colaborativa:', error);
    }
  };

  const finalizarSesionColaborativa = async () => {
    if (sessionId) {
      try {
        await fetch('/api/finalizar-sesion-colaborativa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_sesion_colaborativa: sessionId })
        });
      } catch (error) {
        console.error('Error al finalizar sesión colaborativa:', error);
      }
    }
  };

  const queueInteraction = (tipo: string, detalles: any) => {
    interactionsQueueRef.current.push({ tipo, detalles });
  };

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

  if (!doc || !provider || !sessionId) {
    return null;
  }

  return <TiptapEditor doc={doc} provider={provider} sessionId={sessionId} queueInteraction={queueInteraction} />;
}

type EditorProps = {
  doc: Y.Doc;
  provider: any;
  sessionId: number;
  queueInteraction: (tipo: string, detalles: any) => void;
};

function TiptapEditor({ doc, provider, sessionId, queueInteraction }: EditorProps) {
  const userInfo = useSelf((me) => me.info);
  const lastCapturedContentRef = useRef('');
  const lastCaptureTimeRef = useRef(Date.now());

  const captureContent = useCallback((content: string, force: boolean = false) => {
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
    if (editor && userInfo) {
      queueInteraction('usuario_unido', {
        id_usuario: userInfo.name, // Cambiado de userInfo.id a userInfo.name
        nombre_usuario: userInfo.name
      });
    }
    return () => {
      if (userInfo) {
        queueInteraction('usuario_salido', {
          id_usuario: userInfo.name, // Cambiado de userInfo.id a userInfo.name
          nombre_usuario: userInfo.name
        });
      }
    };
  }, [editor, userInfo, queueInteraction]);

  return (
    <div className={styles.container}>
      <div className={styles.editorHeader}>
        <Toolbar editor={editor} />
        <Avatars />
      </div>
      <EditorContent editor={editor} className={styles.editorContainer} />
    </div>
  );
}*/
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import LiveblocksProvider from "@liveblocks/yjs";
import { useRoom, useSelf } from "@/liveblocks.config";
import { useEffect, useState, useCallback, useRef } from "react";
import { Toolbar } from "./Toolbar";
import styles from "./CollaborativeEditor.module.css";
import { Avatars } from "@/components/Avatars";

const INTERACTION_SEND_INTERVAL = 5000; // 5 segundos
const CONTENT_CAPTURE_INTERVAL = 30000; // 30 segundos

export function CollaborativeEditor() {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<any>();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const interactionsQueueRef = useRef<Array<{ tipo: string; detalles: any }>>([]);

  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksProvider(room, yDoc);
    setDoc(yDoc);
    setProvider(yProvider);

    // Iniciar sesión colaborativa
    iniciarSesionColaborativa(room.id);

    return () => {
      yDoc?.destroy();
      yProvider?.destroy();
      finalizarSesionColaborativa();
    };
  }, [room]);

  const iniciarSesionColaborativa = async (roomId: string) => {
    try {
      const response = await fetch('/api/iniciar-sesion-colaborativa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_room: roomId, tema: 'Colaboración en Influencia de Redes Sociales' })
      });
      const data = await response.json();
      setSessionId(data.id_sesion_colaborativa);
    } catch (error) {
      console.error('Error al iniciar sesión colaborativa:', error);
    }
  };

  const finalizarSesionColaborativa = async () => {
    if (sessionId) {
      try {
        await fetch('/api/finalizar-sesion-colaborativa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_sesion_colaborativa: sessionId })
        });
      } catch (error) {
        console.error('Error al finalizar sesión colaborativa:', error);
      }
    }
  };

  const queueInteraction = (tipo: string, detalles: any) => {
    interactionsQueueRef.current.push({ tipo, detalles });
  };

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

  if (!doc || !provider || !sessionId) {
    return null;
  }

  return <TiptapEditor doc={doc} provider={provider} sessionId={sessionId} queueInteraction={queueInteraction} />;
}

type EditorProps = {
  doc: Y.Doc;
  provider: any;
  sessionId: number;
  queueInteraction: (tipo: string, detalles: any) => void;
};

function TiptapEditor({ doc, provider, sessionId, queueInteraction }: EditorProps) {
  const userInfo = useSelf((me) => me.info);
  const lastCapturedContentRef = useRef('');
  const lastCaptureTimeRef = useRef(Date.now());

  const captureContent = useCallback((content: string, force: boolean = false) => {
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
    if (editor && userInfo) {
      queueInteraction('usuario_unido', {
        id_usuario: userInfo.name, // Cambiado de userInfo.id a userInfo.name
        nombre_usuario: userInfo.name
      });
    }
    return () => {
      if (userInfo) {
        queueInteraction('usuario_salido', {
          id_usuario: userInfo.name, // Cambiado de userInfo.id a userInfo.name
          nombre_usuario: userInfo.name
        });
      }
    };
  }, [editor, userInfo, queueInteraction]);

  return (
    <div className={styles.container}>
      <div className={styles.editorHeader}>
        <Toolbar editor={editor} />
        <Avatars />
      </div>
      <EditorContent editor={editor} className={styles.editorContainer} />
    </div>
  );
}

