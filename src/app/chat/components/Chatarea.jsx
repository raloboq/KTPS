/*
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send } from "lucide-react";
import Image from "next/image";

const INTERACTION_SEND_INTERVAL = 5000; // 5 segundos

const ChatArea = ({ systemInstruction, userName, roomId }) => {
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    { role: "model", parts: "Hola soy Lupi tu ayudante en esta actividad." },
  ]);
  const [genAI, setGenAI] = useState(null);
  const [chat, setChat] = useState(null);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  const messagesQueueRef = useRef([]);
  const interactionsQueueRef = useRef([]);

  useEffect(() => {
    const initializeAI = async () => {
      try {
        const response = await fetch('/api/get-gemini-key');
        const data = await response.json();
        if (data.apiKey) {
          const ai = new GoogleGenerativeAI(data.apiKey);
          setGenAI(ai);
        } else {
          console.error('No se pudo obtener la clave de API de Gemini');
        }
      } catch (error) {
        console.error('Error al inicializar la IA:', error);
      }
    };

    initializeAI();
  }, []);

  useEffect(() => {
    if (genAI && !chat) {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction
      });
      setChat(model.startChat({
        generationConfig: {
          maxOutputTokens: 400,
        },
      }));
    }
  }, [genAI, chat, systemInstruction]);

  useEffect(() => {
    const initChatSession = async () => {
      if (!roomId || !userName) {
        console.error('roomId o userName no proporcionados');
        return;
      }

      try {
        console.log('Iniciando sesión de chat...',roomId, userName);
        const response = await fetch('/api/iniciar-sesion-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_id: roomId, nombre_usuario: userName })
        });
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }
        const data = await response.json();
        setChatSessionId(data.id_sesion_chat);
        setSessionInitialized(true);
        console.log('Sesión de chat iniciada:', data.id_sesion_chat);
      } catch (error) {
        console.error('Error al iniciar sesión de chat:', error);
        // Aquí podrías implementar una lógica de reintento o notificar al usuario
      }
    };

    initChatSession();
  }, [roomId, userName]);

  const queueMessage = (tipo_mensaje, contenido) => {
    messagesQueueRef.current.push({ tipo_mensaje, contenido, nombre_usuario: userName });
  };

  const queueInteraction = (tipo_interaccion, detalles) => {
    interactionsQueueRef.current.push({ tipo_interaccion, detalles, nombre_usuario: userName });
  };

  const sendQueuedData = useCallback(async () => {
    if (!sessionInitialized) {
      console.log('Sesión de chat no inicializada aún');
      return;
    }

    if (!chatSessionId) {
      console.error('chatSessionId es null');
      return;
    }

    if (messagesQueueRef.current.length === 0 && interactionsQueueRef.current.length === 0) {
      return;
    }

    const messagesToSend = [...messagesQueueRef.current];
    const interactionsToSend = [...interactionsQueueRef.current];
    messagesQueueRef.current = [];
    interactionsQueueRef.current = [];

    try {
      console.log('Enviando datos del chat...', chatSessionId, messagesToSend, interactionsToSend);
      const response = await fetch('/api/registrar-datos-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_sesion_chat: chatSessionId,
          mensajes: messagesToSend,
          interacciones: interactionsToSend
        })
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      console.log('Datos enviados con éxito');
    } catch (error) {
      console.error('Error al enviar datos del chat:', error);
      // Volver a poner los datos en la cola si falló el envío
      messagesQueueRef.current.push(...messagesToSend);
      interactionsQueueRef.current.push(...interactionsToSend);
    }
  }, [chatSessionId, sessionInitialized]);

  useEffect(() => {
    const intervalId = setInterval(sendQueuedData, INTERACTION_SEND_INTERVAL);
    return () => clearInterval(intervalId);
  }, [sendQueuedData]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  async function handleSend() {
    if (!input.trim() || !chat || loading) return;
    
    setLoading(true);
    setHistory(prev => [...prev, { role: "user", parts: input }]);
    const currentInput = input;
    setInput("");
    
    queueMessage('usuario', currentInput);
    queueInteraction('mensaje_enviado', { timestamp: Date.now() });
    
    try {
      const result = await chat.sendMessage(currentInput);
      const response = await result.response;
      const text = response.text();
      setHistory(prev => [...prev, { role: "model", parts: text }]);
      
      queueMessage('modelo', text);
      queueInteraction('respuesta_recibida', { timestamp: Date.now() });
    } catch (error) {
      console.error("Error in chat:", error);
      const errorMessage = "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.";
      setHistory(prev => [...prev, { role: "model", parts: errorMessage }]);
      
      queueMessage('modelo', errorMessage);
      queueInteraction('error', { 
        mensaje: "Error en la comunicación con el chatbot",
        timestamp: Date.now()
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    
    <div className="chat-area" style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      <div className="messages" style={{
        padding: '20px',
        flexGrow: 1,
        overflowY: 'auto'
      }}>
        {history.map((item, index) => (
          <div key={index} className={`message ${item.role}`} style={{
            display: 'flex',
            flexDirection: item.role === 'model' ? 'row' : 'row-reverse',
            alignItems: 'flex-start',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              marginRight: item.role === 'model' ? '10px' : '0',
              marginLeft: item.role === 'user' ? '10px' : '0'
            }}>
              <Image
                src={item.role === 'model' ? "https://i.imgur.com/WR4vapu.jpg" : "https://i.imgur.com/qbNi3BK.jpg"}
                alt={item.role === 'model' ? "Lupi avatar" : "User avatar"}
                width={40}
                height={40}
              />
            </div>
            <div style={{
              backgroundColor: item.role === 'model' ? '#E6007E' : '#009A93',
              color: '#ffffff',
              padding: '10px 15px',
              borderRadius: '15px',
              maxWidth: '70%',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>{item.parts}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area" style={{
        display: 'flex',
        padding: '10px',
        borderTop: '1px solid #e0e0e0'
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu mensaje aquí..."
          style={{
            flexGrow: 1,
            padding: '10px',
            border: '1px solid #C8D300',
            borderRadius: '20px',
            marginRight: '10px',
            resize: 'none',
            maxHeight: '80px',
            minHeight: '40px',
            overflowY: 'auto'
          }}
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim() || !chat}
          style={{
            backgroundColor: loading || !input.trim() || !chat ? '#d0d0d0' : '#662483',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: loading || !input.trim() || !chat ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? (
            <div className="loading-spinner" style={{
              border: '2px solid #ffffff',
              borderTop: '2px solid #662483',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              animation: 'spin 1s linear infinite'
            }}></div>
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatArea;
*/
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send } from "lucide-react";

const INTERACTION_SEND_INTERVAL = 5000; // 5 segundos

const ChatArea = ({ systemInstruction, userName, roomId }) => {
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    { role: "model", parts: "Hola soy Lupi tu ayudante en esta actividad." },
  ]);
  const [genAI, setGenAI] = useState(null);
  const [chat, setChat] = useState(null);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  const messagesQueueRef = useRef([]);
  const interactionsQueueRef = useRef([]);

  // URLs de las imágenes de Imgur
  const LUPI_IMAGE_URL = "https://i.imgur.com/WR4vapu.jpg";
  const USER_IMAGE_URL = "https://i.imgur.com/qbNi3BK.jpg";

  useEffect(() => {
    const initializeAI = async () => {
      try {
        const response = await fetch('/api/get-gemini-key');
        const data = await response.json();
        if (data.apiKey) {
          const ai = new GoogleGenerativeAI(data.apiKey);
          setGenAI(ai);
        } else {
          console.error('No se pudo obtener la clave de API de Gemini');
        }
      } catch (error) {
        console.error('Error al inicializar la IA:', error);
      }
    };

    initializeAI();
  }, []);

  useEffect(() => {
    if (genAI && !chat) {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction
      });
      setChat(model.startChat({
        generationConfig: {
          maxOutputTokens: 400,
        },
      }));
    }
  }, [genAI, chat, systemInstruction]);

  useEffect(() => {
    const initChatSession = async () => {
      if (!roomId || !userName) {
        console.error('roomId o userName no proporcionados');
        return;
      }

      try {
        console.log('Iniciando sesión de chat...', roomId, userName);
        const response = await fetch('/api/iniciar-sesion-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_id: roomId, nombre_usuario: userName })
        });
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }
        const data = await response.json();
        setChatSessionId(data.id_sesion_chat);
        setSessionInitialized(true);
        console.log('Sesión de chat iniciada:', data.id_sesion_chat);
      } catch (error) {
        console.error('Error al iniciar sesión de chat:', error);
      }
    };

    initChatSession();
  }, [roomId, userName]);

  const queueMessage = (tipo_mensaje, contenido) => {
    messagesQueueRef.current.push({ tipo_mensaje, contenido, nombre_usuario: userName });
  };

  const queueInteraction = (tipo_interaccion, detalles) => {
    interactionsQueueRef.current.push({ tipo_interaccion, detalles, nombre_usuario: userName });
  };

  const sendQueuedData = useCallback(async () => {
    if (!sessionInitialized) {
      console.log('Sesión de chat no inicializada aún');
      return;
    }

    if (!chatSessionId) {
      console.error('chatSessionId es null');
      return;
    }

    if (messagesQueueRef.current.length === 0 && interactionsQueueRef.current.length === 0) {
      return;
    }

    const messagesToSend = [...messagesQueueRef.current];
    const interactionsToSend = [...interactionsQueueRef.current];
    messagesQueueRef.current = [];
    interactionsQueueRef.current = [];

    try {
      console.log('Enviando datos del chat...', chatSessionId, messagesToSend, interactionsToSend);
      const response = await fetch('/api/registrar-datos-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_sesion_chat: chatSessionId,
          mensajes: messagesToSend,
          interacciones: interactionsToSend
        })
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      console.log('Datos enviados con éxito');
    } catch (error) {
      console.error('Error al enviar datos del chat:', error);
      // Volver a poner los datos en la cola si falló el envío
      messagesQueueRef.current.push(...messagesToSend);
      interactionsQueueRef.current.push(...interactionsToSend);
    }
  }, [chatSessionId, sessionInitialized]);

  useEffect(() => {
    const intervalId = setInterval(sendQueuedData, INTERACTION_SEND_INTERVAL);
    return () => clearInterval(intervalId);
  }, [sendQueuedData]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  async function handleSend() {
    if (!input.trim() || !chat || loading) return;
    
    setLoading(true);
    setHistory(prev => [...prev, { role: "user", parts: input }]);
    const currentInput = input;
    setInput("");
    
    queueMessage('usuario', currentInput);
    queueInteraction('mensaje_enviado', { timestamp: Date.now() });
    
    try {
      const result = await chat.sendMessage(currentInput);
      const response = await result.response;
      const text = response.text();
      setHistory(prev => [...prev, { role: "model", parts: text }]);
      
      queueMessage('modelo', text);
      queueInteraction('respuesta_recibida', { timestamp: Date.now() });
    } catch (error) {
      console.error("Error in chat:", error);
      const errorMessage = "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.";
      setHistory(prev => [...prev, { role: "model", parts: errorMessage }]);
      
      queueMessage('modelo', errorMessage);
      queueInteraction('error', { 
        mensaje: "Error en la comunicación con el chatbot",
        timestamp: Date.now()
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Función para manejar errores de carga de imágenes
  const handleImageError = (e, role) => {
    // Mostrar una inicial en lugar de la imagen cuando falla la carga
    e.target.style.display = 'none';
    e.target.parentNode.style.display = 'flex';
    e.target.parentNode.style.justifyContent = 'center';
    e.target.parentNode.style.alignItems = 'center';
    e.target.parentNode.innerHTML = role === 'model' ? 'L' : 'U';
    e.target.parentNode.style.color = 'white';
    e.target.parentNode.style.fontWeight = 'bold';
    e.target.parentNode.style.fontSize = '16px';
  };

  return (
    <div className="chat-area" style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      <div className="messages" style={{
        padding: '20px',
        flexGrow: 1,
        overflowY: 'auto'
      }}>
        {history.map((item, index) => (
          <div key={index} className={`message ${item.role}`} style={{
            display: 'flex',
            flexDirection: item.role === 'model' ? 'row' : 'row-reverse',
            alignItems: 'flex-start',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              marginRight: item.role === 'model' ? '10px' : '0',
              marginLeft: item.role === 'user' ? '10px' : '0',
              backgroundColor: item.role === 'model' ? '#E6007E' : '#009A93',
            }}>
              <img
                src={item.role === 'model' ? LUPI_IMAGE_URL : USER_IMAGE_URL}
                alt={item.role === 'model' ? "Lupi" : "Usuario"}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => handleImageError(e, item.role)}
              />
            </div>
            <div style={{
              backgroundColor: item.role === 'model' ? '#E6007E' : '#009A93',
              color: '#ffffff',
              padding: '10px 15px',
              borderRadius: '15px',
              maxWidth: '70%',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>{item.parts}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area" style={{
        display: 'flex',
        padding: '10px',
        borderTop: '1px solid #e0e0e0'
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu mensaje aquí..."
          style={{
            flexGrow: 1,
            padding: '10px',
            border: '1px solid #C8D300',
            borderRadius: '20px',
            marginRight: '10px',
            resize: 'none',
            maxHeight: '80px',
            minHeight: '40px',
            overflowY: 'auto'
          }}
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim() || !chat}
          style={{
            backgroundColor: loading || !input.trim() || !chat ? '#d0d0d0' : '#662483',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: loading || !input.trim() || !chat ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? (
            <div className="loading-spinner" style={{
              border: '2px solid #ffffff',
              borderTop: '2px solid #662483',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              animation: 'spin 1s linear infinite'
            }}></div>
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatArea;