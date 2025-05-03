/*
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import styles from './sharePage.module.css';

interface Reflection {
  id: number;
  userName: string;
  content: string;
  timestamp: string;
}

interface Collaboration {
  id: number;
  roomName: string;
  content: string;
  timestamp: string;
  participants: string[];
}

export default function SharePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [activeTab, setActiveTab] = useState<'reflections' | 'collaborations'>('reflections');
  const [expandedReflection, setExpandedReflection] = useState<number | null>(null);
  const [expandedCollaboration, setExpandedCollaboration] = useState<number | null>(null);
  const [feedbackSent, setFeedbackSent] = useState<{[key: number]: boolean}>({});
  const [feedbackText, setFeedbackText] = useState<{[key: number]: string}>({});
  
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [phaseConfig, setPhaseConfig] = useState<{
    share_phase_duration: number;
    share_phase_instructions: string;
  } | null>(null);

const parseCollaborativeContent = (content: string) => {
  // Reemplazar etiquetas personalizadas con HTML estándar
  return content
    .replace(/<paragraph>/g, '<p>')
    .replace(/<\/paragraph>/g, '</p>')
    .replace(/<bold>/g, '<strong>')
    .replace(/<\/bold>/g, '</strong>')
    .replace(/<italic>/g, '<em>')
    .replace(/<\/italic>/g, '</em>')
    .replace(/<strikethrough>/g, '<span style="text-decoration: line-through;">')
    .replace(/<\/strikethrough>/g, '</span>');
};

  // Cargar datos desde cookies y configurar la página
  useEffect(() => {
    // Obtener datos de las cookies
    const userNameFromCookie = Cookies.get('studentUsername');
    const roomIdFromCookie = Cookies.get('roomId');
    const roomNameFromCookie = Cookies.get('roomName');
    
    if (!userNameFromCookie || !roomIdFromCookie) {
      setError('Faltan datos necesarios. Por favor, vuelve a iniciar el proceso.');
      setLoading(false);
      return;
    }
    
    setUserName(userNameFromCookie);
    setRoomId(roomIdFromCookie);
    
    if (roomNameFromCookie) {
      setRoomName(roomNameFromCookie);
    }

    // Carga la configuración para obtener la duración de la fase share
    fetchRoomConfig();

    // Cargar datos de reflexiones y colaboraciones
    fetchShareData();
  }, []);

  // Obtener la configuración de la sala (incluyendo duración de la fase)
  const fetchRoomConfig = async () => {
    try {
      const response = await fetch('/api/student/check-room-status');
      if (!response.ok) {
        throw new Error('Error al cargar configuración de la sala');
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Error al cargar datos de la actividad');
      }

      // Configurar el temporizador con la duración de la fase share
      const shareConfig = {
        share_phase_duration: data.room.share_phase_duration || 600, // 10 min por defecto
        share_phase_instructions: data.room.share_phase_instructions || 'No hay instrucciones específicas'
      };
      
      setPhaseConfig(shareConfig);
      setTimeRemaining(shareConfig.share_phase_duration);
      
      // Iniciar el temporizador
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            finalizarFaseShare();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      setTimeRemaining(600); // 10 minutos por defecto
    }
  };

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Finalizar la fase de share
  const finalizarFaseShare = async () => {
    try {
      console.log('Finalizando fase de Share');
      
      // Mostrar un mensaje de finalización
      alert('¡Gracias por participar! La actividad ha finalizado.');
      
      // Redirigir a la página de resumen o finalización
      router.push('/activity-completed');
    } catch (error) {
      console.error('Error al finalizar fase Share:', error);
    }
  };

  // Obtener todos los datos necesarios para la fase share
  const fetchShareData = async () => {
    try {
      setLoading(true);
      
      // Obtener el ID de la sala de las cookies
      const roomIdFromCookie = Cookies.get('roomId');
      
      if (!roomIdFromCookie) {
        throw new Error('No se encontró el ID de la sala');
      }
      
      // Obtener datos completos para la fase share
      const response = await fetch(`/api/obtener-datos-share?roomId=${roomIdFromCookie}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener datos para la fase share');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error al obtener datos');
      }
      
      // Actualizar estados con los datos reales
      if (data.colaboracion) {
        setCollaborations([data.colaboracion]);
      }
      
      if (data.reflexiones && data.reflexiones.length > 0) {
        setReflections(data.reflexiones);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos para la fase share:', error);
      setError('Error al cargar los datos necesarios. Por favor, intenta de nuevo.');
      
      // Si hay error en la carga, usar datos de ejemplo para no bloquear la interfaz
      setReflections([
        {
          id: 1,
          userName: 'Estudiante Ejemplo',
          content: 'Esta es una reflexión de ejemplo porque no se pudieron cargar los datos reales.',
          timestamp: new Date().toISOString()
        }
      ]);
      
      setCollaborations([
        {
          id: 1,
          roomName: roomName || 'Sala Colaborativa',
          content: 'Este es un contenido de ejemplo porque no se pudieron cargar los datos reales.',
          timestamp: new Date().toISOString(),
          participants: [userName || 'Usuario Actual', 'Otro Participante']
        }
      ]);
      
      setLoading(false);
    }
  };

  // Manejar el envío de retroalimentación
  const handleSendFeedback = async (id: number, type: 'reflection' | 'collaboration') => {
    if (!feedbackText[id] || feedbackText[id].trim() === '') {
      alert('Por favor, escribe un comentario antes de enviar');
      return;
    }
    
    try {
      const response = await fetch('/api/guardar-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_contenido: type === 'reflection' ? 'reflexion' : 'colaboracion',
          id_contenido: id,
          nombre_usuario: userName,
          contenido: feedbackText[id]
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar feedback');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Actualizar estado para mostrar que se envió correctamente
        setFeedbackSent(prev => ({
          ...prev,
          [id]: true
        }));
        
        // Limpiar el texto
        setFeedbackText(prev => ({
          ...prev,
          [id]: ''
        }));
        
        // Mostrar confirmación
        alert('¡Tu retroalimentación ha sido enviada!');
      } else {
        throw new Error(data.error || 'Error al enviar retroalimentación');
      }
    } catch (error) {
      console.error('Error al enviar retroalimentación:', error);
      alert('Error al enviar retroalimentación. Por favor, intenta de nuevo.');
    }
  };

  // Manejar cambios en la entrada de retroalimentación
  const handleFeedbackChange = (id: number, text: string) => {
    setFeedbackText(prev => ({
      ...prev,
      [id]: text
    }));
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Cargando reflexiones y colaboraciones...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fase de Compartir (Share)</h1>
      <p className={`${styles.timer} ${timeRemaining <= 120 ? styles.timerWarning : ''}`}>
        Tiempo Restante: {formatTime(timeRemaining)}
      </p>
      
      <div className={styles.instructionsContainer}>
        <h2 className={styles.subtitle}>Instrucciones</h2>
        <p>
          {phaseConfig?.share_phase_instructions || 
           'En esta fase final del proceso Think-Pair-Share, puedes ver las reflexiones individuales y los documentos colaborativos creados por los demás estudiantes. Tómate un tiempo para revisar el trabajo de tus compañeros y proporcionar retroalimentación constructiva.'}
        </p>
      </div>
      
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'reflections' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('reflections')}
        >
          Reflexiones Individuales
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'collaborations' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('collaborations')}
        >
          Documentos Colaborativos
        </button>
      </div>
      
      {activeTab === 'reflections' && (
        <div className={styles.contentContainer}>
          <h3 className={styles.contentTitle}>Reflexiones de la Fase de Pensamiento Individual</h3>
          
          {reflections.length === 0 ? (
            <p className={styles.emptyState}>No hay reflexiones disponibles.</p>
          ) : (
            <div className={styles.cardGrid}>
              {reflections.map(reflection => (
                <div key={reflection.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h4 className={styles.cardTitle}>{reflection.userName}</h4>
                    <p className={styles.cardTimestamp}>
                      {new Date(reflection.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className={styles.cardContent}>
                    {expandedReflection === reflection.id ? (
                      <p>{reflection.content}</p>
                    ) : (
                      <p>{reflection.content.substring(0, 150)}...
                        <button 
                          className={styles.readMoreButton}
                          onClick={() => setExpandedReflection(reflection.id)}
                        >
                          Leer más
                        </button>
                      </p>
                    )}
                    
                    {expandedReflection === reflection.id && (
                      <button 
                        className={styles.readLessButton}
                        onClick={() => setExpandedReflection(null)}
                      >
                        Leer menos
                      </button>
                    )}
                  </div>
                  
                  <div className={styles.feedbackSection}>
                    {feedbackSent[reflection.id] ? (
                      <p className={styles.feedbackSent}>
                        ✓ Retroalimentación enviada
                      </p>
                    ) : (
                      <>
                        <textarea
                          className={styles.feedbackInput}
                          placeholder="Escribe tu retroalimentación aquí..."
                          value={feedbackText[reflection.id] || ''}
                          onChange={(e) => handleFeedbackChange(reflection.id, e.target.value)}
                        />
                        <button
                          className={styles.feedbackButton}
                          onClick={() => handleSendFeedback(reflection.id, 'reflection')}
                        >
                          Enviar comentario
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'collaborations' && (
  <div className={styles.contentContainer}>
    <h3 className={styles.contentTitle}>Documentos de la Fase de Colaboración en Parejas</h3>
    
    {collaborations.length === 0 ? (
      <p className={styles.emptyState}>No hay documentos colaborativos disponibles.</p>
    ) : (
      <div className={styles.cardGrid}>
        {collaborations.map(collab => (
          <div key={collab.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h4 className={styles.cardTitle}>{collab.roomName}</h4>
              <p className={styles.cardParticipants}>
                Participantes: {collab.participants.length > 0 
                  ? collab.participants.join(', ') 
                  : 'No hay información de participantes'}
              </p>
              <p className={styles.cardTimestamp}>
                {new Date(collab.timestamp).toLocaleString()}
              </p>
            </div>
            
            <div className={styles.cardContent}>
              {expandedCollaboration === collab.id ? (
                <div 
                  className={styles.formattedContent}
                  dangerouslySetInnerHTML={{ 
                    __html: parseCollaborativeContent(collab.content) 
                  }}
                />
              ) : (
                <p>
                  {collab.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                  <button 
                    className={styles.readMoreButton}
                    onClick={() => setExpandedCollaboration(collab.id)}
                  >
                    Leer más
                  </button>
                </p>
              )}
              
              {expandedCollaboration === collab.id && (
                <button 
                  className={styles.readLessButton}
                  onClick={() => setExpandedCollaboration(null)}
                >
                  Leer menos
                </button>
              )}
            </div>
            
            <div className={styles.feedbackSection}>
              {feedbackSent[collab.id] ? (
                <p className={styles.feedbackSent}>
                  ✓ Retroalimentación enviada
                </p>
              ) : (
                <>
                  <textarea
                    className={styles.feedbackInput}
                    placeholder="Escribe tu retroalimentación aquí..."
                    value={feedbackText[collab.id] || ''}
                    onChange={(e) => handleFeedbackChange(collab.id, e.target.value)}
                  />
                  <button
                    className={styles.feedbackButton}
                    onClick={() => handleSendFeedback(collab.id, 'collaboration')}
                  >
                    Enviar comentario
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
      
      {timeRemaining <= 30 && (
        <div className={styles.finalCountdown}>
          <p>La fase de Share está por terminar. ¡Asegúrate de haber enviado tus comentarios!</p>
        </div>
      )}
    </div>
  );
}
  */
 //version sin comentarios por parte de los alumnos
 'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import styles from './sharePage.module.css';

interface Reflection {
  id: number;
  userName: string;
  content: string;
  timestamp: string;
}

interface Collaboration {
  id: number;
  roomName: string;
  content: string;
  timestamp: string;
  participants: string[];
}

export default function SharePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [activeTab, setActiveTab] = useState<'reflections' | 'collaborations'>('reflections');
  const [expandedReflection, setExpandedReflection] = useState<number | null>(null);
  const [expandedCollaboration, setExpandedCollaboration] = useState<number | null>(null);
  const [feedbackSent, setFeedbackSent] = useState<{[key: number]: boolean}>({});
  const [feedbackText, setFeedbackText] = useState<{[key: number]: string}>({});
  
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [phaseConfig, setPhaseConfig] = useState<{
    share_phase_duration: number;
    share_phase_instructions: string;
  } | null>(null);

const parseCollaborativeContent = (content: string) => {
  // Reemplazar etiquetas personalizadas con HTML estándar
  return content
    .replace(/<paragraph>/g, '<p>')
    .replace(/<\/paragraph>/g, '</p>')
    .replace(/<bold>/g, '<strong>')
    .replace(/<\/bold>/g, '</strong>')
    .replace(/<italic>/g, '<em>')
    .replace(/<\/italic>/g, '</em>')
    .replace(/<strikethrough>/g, '<span style="text-decoration: line-through;">')
    .replace(/<\/strikethrough>/g, '</span>');
};

  // Cargar datos desde cookies y configurar la página
  useEffect(() => {
    // Obtener datos de las cookies
    const userNameFromCookie = Cookies.get('studentUsername');
    const roomIdFromCookie = Cookies.get('roomId');
    const roomNameFromCookie = Cookies.get('roomName');
    
    if (!userNameFromCookie || !roomIdFromCookie) {
      setError('Faltan datos necesarios. Por favor, vuelve a iniciar el proceso.');
      setLoading(false);
      return;
    }
    
    setUserName(userNameFromCookie);
    setRoomId(roomIdFromCookie);
    
    if (roomNameFromCookie) {
      setRoomName(roomNameFromCookie);
    }

    // Carga la configuración para obtener la duración de la fase share
    fetchRoomConfig();

    // Cargar datos de reflexiones y colaboraciones
    fetchShareData();
  }, []);

  // Obtener la configuración de la sala (incluyendo duración de la fase)
  const fetchRoomConfig = async () => {
    try {
      const response = await fetch('/api/student/check-room-status');
      if (!response.ok) {
        throw new Error('Error al cargar configuración de la sala');
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Error al cargar datos de la actividad');
      }

      // Configurar el temporizador con la duración de la fase share
      const shareConfig = {
        share_phase_duration: data.room.share_phase_duration || 600, // 10 min por defecto
        share_phase_instructions: data.room.share_phase_instructions || 'No hay instrucciones específicas'
      };
      
      setPhaseConfig(shareConfig);
      setTimeRemaining(shareConfig.share_phase_duration);
      
      // Iniciar el temporizador
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            finalizarFaseShare();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      setTimeRemaining(600); // 10 minutos por defecto
    }
  };

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Finalizar la fase de share
  const finalizarFaseShare = async () => {
    try {
      console.log('Finalizando fase de Share');
      
      // Mostrar un mensaje de finalización
      alert('¡Gracias por participar! La actividad ha finalizado.');
      
      // Redirigir a la página de resumen o finalización
      router.push('/activity-completed');
    } catch (error) {
      console.error('Error al finalizar fase Share:', error);
    }
  };

  // Obtener todos los datos necesarios para la fase share
  const fetchShareData = async () => {
    try {
      setLoading(true);
      
      // Obtener el ID de la sala de las cookies
      const roomIdFromCookie = Cookies.get('roomId');
      
      if (!roomIdFromCookie) {
        throw new Error('No se encontró el ID de la sala');
      }
      
      // Obtener datos completos para la fase share
      const response = await fetch(`/api/obtener-datos-share?roomId=${roomIdFromCookie}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener datos para la fase share');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error al obtener datos');
      }
      
      // Actualizar estados con los datos reales
      if (data.colaboracion) {
        setCollaborations([data.colaboracion]);
      }
      
      if (data.reflexiones && data.reflexiones.length > 0) {
        setReflections(data.reflexiones);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos para la fase share:', error);
      setError('Error al cargar los datos necesarios. Por favor, intenta de nuevo.');
      
      // Si hay error en la carga, usar datos de ejemplo para no bloquear la interfaz
      setReflections([
        {
          id: 1,
          userName: 'Estudiante Ejemplo',
          content: 'Esta es una reflexión de ejemplo porque no se pudieron cargar los datos reales.',
          timestamp: new Date().toISOString()
        }
      ]);
      
      setCollaborations([
        {
          id: 1,
          roomName: roomName || 'Sala Colaborativa',
          content: 'Este es un contenido de ejemplo porque no se pudieron cargar los datos reales.',
          timestamp: new Date().toISOString(),
          participants: [userName || 'Usuario Actual', 'Otro Participante']
        }
      ]);
      
      setLoading(false);
    }
  };

  // Manejar el envío de retroalimentación
  const handleSendFeedback = async (id: number, type: 'reflection' | 'collaboration') => {
    if (!feedbackText[id] || feedbackText[id].trim() === '') {
      alert('Por favor, escribe un comentario antes de enviar');
      return;
    }
    
    try {
      const response = await fetch('/api/guardar-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_contenido: type === 'reflection' ? 'reflexion' : 'colaboracion',
          id_contenido: id,
          nombre_usuario: userName,
          contenido: feedbackText[id]
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar feedback');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Actualizar estado para mostrar que se envió correctamente
        setFeedbackSent(prev => ({
          ...prev,
          [id]: true
        }));
        
        // Limpiar el texto
        setFeedbackText(prev => ({
          ...prev,
          [id]: ''
        }));
        
        // Mostrar confirmación
        alert('¡Tu retroalimentación ha sido enviada!');
      } else {
        throw new Error(data.error || 'Error al enviar retroalimentación');
      }
    } catch (error) {
      console.error('Error al enviar retroalimentación:', error);
      alert('Error al enviar retroalimentación. Por favor, intenta de nuevo.');
    }
  };

  // Manejar cambios en la entrada de retroalimentación
  const handleFeedbackChange = (id: number, text: string) => {
    setFeedbackText(prev => ({
      ...prev,
      [id]: text
    }));
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Cargando reflexiones y colaboraciones...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fase de Compartir (Share)</h1>
      <p className={`${styles.timer} ${timeRemaining <= 120 ? styles.timerWarning : ''}`}>
        Tiempo Restante: {formatTime(timeRemaining)}
      </p>
      
      <div className={styles.instructionsContainer}>
        <h2 className={styles.subtitle}>Instrucciones</h2>
        <p>
          {phaseConfig?.share_phase_instructions || 
           'En esta fase final del proceso Think-Pair-Share, puedes ver las reflexiones individuales y los documentos colaborativos creados por los demás estudiantes. Tómate un tiempo para revisar el trabajo de tus compañeros.'}
        </p>
      </div>
      
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'reflections' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('reflections')}
        >
          Reflexiones Individuales
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'collaborations' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('collaborations')}
        >
          Documentos Colaborativos
        </button>
      </div>
      
      {activeTab === 'reflections' && (
        <div className={styles.contentContainer}>
          <h3 className={styles.contentTitle}>Reflexiones de la Fase de Pensamiento Individual</h3>
          
          {reflections.length === 0 ? (
            <p className={styles.emptyState}>No hay reflexiones disponibles.</p>
          ) : (
            <div className={styles.cardGrid}>
              {reflections.map(reflection => (
                <div key={reflection.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h4 className={styles.cardTitle}>{reflection.userName}</h4>
                    <p className={styles.cardTimestamp}>
                      {new Date(reflection.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className={styles.cardContent}>
                    {expandedReflection === reflection.id ? (
                      <p>{reflection.content}</p>
                    ) : (
                      <p>{reflection.content.substring(0, 150)}...
                        <button 
                          className={styles.readMoreButton}
                          onClick={() => setExpandedReflection(reflection.id)}
                        >
                          Leer más
                        </button>
                      </p>
                    )}
                    
                    {expandedReflection === reflection.id && (
                      <button 
                        className={styles.readLessButton}
                        onClick={() => setExpandedReflection(null)}
                      >
                        Leer menos
                      </button>
                    )}
                  </div>
                  
                  {/* Sección de feedback oculta visualmente pero manteniendo la lógica */}
                  <div className={styles.feedbackSection} style={{ display: 'none' }}>
                    {feedbackSent[reflection.id] ? (
                      <p className={styles.feedbackSent}>
                        ✓ Retroalimentación enviada
                      </p>
                    ) : (
                      <>
                        <textarea
                          className={styles.feedbackInput}
                          placeholder="Escribe tu retroalimentación aquí..."
                          value={feedbackText[reflection.id] || ''}
                          onChange={(e) => handleFeedbackChange(reflection.id, e.target.value)}
                        />
                        <button
                          className={styles.feedbackButton}
                          onClick={() => handleSendFeedback(reflection.id, 'reflection')}
                        >
                          Enviar comentario
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'collaborations' && (
        <div className={styles.contentContainer}>
          <h3 className={styles.contentTitle}>Documentos de la Fase de Colaboración en Parejas</h3>
          
          {collaborations.length === 0 ? (
            <p className={styles.emptyState}>No hay documentos colaborativos disponibles.</p>
          ) : (
            <div className={styles.cardGrid}>
              {collaborations.map(collab => (
                <div key={collab.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h4 className={styles.cardTitle}>{collab.roomName}</h4>
                    <p className={styles.cardParticipants}>
                      Participantes: {collab.participants.length > 0 
                        ? collab.participants.join(', ') 
                        : 'No hay información de participantes'}
                    </p>
                    <p className={styles.cardTimestamp}>
                      {new Date(collab.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className={styles.cardContent}>
                    {expandedCollaboration === collab.id ? (
                      <div 
                        className={styles.formattedContent}
                        dangerouslySetInnerHTML={{ 
                          __html: parseCollaborativeContent(collab.content) 
                        }}
                      />
                    ) : (
                      <p>
                        {collab.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                        <button 
                          className={styles.readMoreButton}
                          onClick={() => setExpandedCollaboration(collab.id)}
                        >
                          Leer más
                        </button>
                      </p>
                    )}
                    
                    {expandedCollaboration === collab.id && (
                      <button 
                        className={styles.readLessButton}
                        onClick={() => setExpandedCollaboration(null)}
                      >
                        Leer menos
                      </button>
                    )}
                  </div>
                  
                  {/* Sección de feedback oculta visualmente pero manteniendo la lógica */}
                  <div className={styles.feedbackSection} style={{ display: 'none' }}>
                    {feedbackSent[collab.id] ? (
                      <p className={styles.feedbackSent}>
                        ✓ Retroalimentación enviada
                      </p>
                    ) : (
                      <>
                        <textarea
                          className={styles.feedbackInput}
                          placeholder="Escribe tu retroalimentación aquí..."
                          value={feedbackText[collab.id] || ''}
                          onChange={(e) => handleFeedbackChange(collab.id, e.target.value)}
                        />
                        <button
                          className={styles.feedbackButton}
                          onClick={() => handleSendFeedback(collab.id, 'collaboration')}
                        >
                          Enviar comentario
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {timeRemaining <= 30 && (
        <div className={styles.finalCountdown}>
          <p>La fase de Share está por terminar.</p>
        </div>
      )}
    </div>
  );
}