/*
"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import Image from "next/image";

const ChatArea = () => {
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    { role: "model", parts: "Hola soy Lupi tu ayudante en esta actividad." },
  ]);
  const [genAI, setGenAI] = useState(null);
  const [chat, setChat] = useState(null);

  useEffect(() => {
    const ai = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    setGenAI(ai);
  }, []);

  useEffect(() => {
    if (genAI && !chat) {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "Eres un profesor de programación de computadores de universidad, no lo darás ningun codigo ni ofreceras ejemplos, solo le explicaras al estudiante los pasos necesarios para lograrlo usa respuestas cortas y concisas" 
      });
      setChat(model.startChat({
        generationConfig: {
          maxOutputTokens: 400,
        },
      }));
    }
  }, [genAI, chat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  async function handleSend() {
    if (!input.trim() || !chat || loading) return;
    
    setLoading(true);
    setHistory(prev => [...prev, { role: "user", parts: input }]);
    const currentInput = input;
    setInput("");
    
    try {
      const result = await chat.sendMessage(currentInput);
      const response = await result.response;
      const text = response.text();
      setHistory(prev => [...prev, { role: "model", parts: text }]);
    } catch (error) {
      console.error("Error in chat:", error);
      setHistory(prev => [...prev, { role: "model", parts: "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo." }]);
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
      maxWidth: '400px',
      margin: '20px auto',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      <div className="messages" style={{
        padding: '20px',
        maxHeight: '400px',
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
              backgroundColor: item.role === 'model' ? '#e6f7ff' : '#fff9e6',
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
            border: '1px solid #d0d0d0',
            borderRadius: '20px',
            marginRight: '10px',
            resize: 'none',
            maxHeight: '40px',
            minHeight: '40px',
            overflowY: 'auto'
          }}
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim() || !chat}
          style={{
            backgroundColor: loading || !input.trim() || !chat ? '#d0d0d0' : '#1a73e8',
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
              borderTop: '2px solid #1a73e8',
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

export default ChatArea;*/
"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import Image from "next/image";

const DEFAULT_SYSTEM_INSTRUCTION = "Eres un profesor de programación de computadores de universidad, no lo darás ningun codigo ni ofreceras ejemplos, solo le explicaras al estudiante los pasos necesarios para lograrlo usa respuestas cortas y concisas";

const ChatArea = ({ systemInstruction = DEFAULT_SYSTEM_INSTRUCTION }) => {
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    { role: "model", parts: "Hola soy Lupi tu ayudante en esta actividad." },
  ]);
  const [genAI, setGenAI] = useState(null);
  const [chat, setChat] = useState(null);

  useEffect(() => {
    const ai = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    setGenAI(ai);
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  async function handleSend() {
    if (!input.trim() || !chat || loading) return;
    
    setLoading(true);
    setHistory(prev => [...prev, { role: "user", parts: input }]);
    const currentInput = input;
    setInput("");
    
    try {
      const result = await chat.sendMessage(currentInput);
      const response = await result.response;
      const text = response.text();
      setHistory(prev => [...prev, { role: "model", parts: text }]);
    } catch (error) {
      console.error("Error in chat:", error);
      setHistory(prev => [...prev, { role: "model", parts: "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo." }]);
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
    /*<div className="chat-area" style={{
      width: '100%',
      maxWidth: '800px',
      margin: '20px auto',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '400px' // Ajustado a 400px de altura total
    }}>*/
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