/*'use client';

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
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutos

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
    
    // Configurar el temporizador
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          console.log('¡Se acabó el tiempo!');
          finalizarFaseShare();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    // Cargar datos de reflexiones y colaboraciones
    fetchReflections();
    fetchCollaborations();
    
    // Limpieza al desmontar
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Finalizar la fase de share
  const finalizarFaseShare = async () => {
    try {
      // Aquí podrías enviar datos de interacción o estadísticas si es necesario
      console.log('Finalizando fase de Share');
      
      // Mostrar un mensaje de finalización
      alert('¡Gracias por participar! La actividad ha finalizado.');
      
      // Redirigir a una página de resumen o a la página principal
      router.push('/activity-completed');
    } catch (error) {
      console.error('Error al finalizar fase Share:', error);
    }
  };

  // Simular la carga de reflexiones (en producción, esto sería una llamada a API)
  const fetchReflections = async () => {
    try {
      // Simulación de datos para demostración
      // En producción, esto sería una llamada a la API real
      // const response = await fetch(`/api/reflections?roomId=${roomId}`);
      // const data = await response.json();
      
      // Datos de demostración
      setTimeout(() => {
        const demoData: Reflection[] = [
          {
            id: 1,
            userName: 'Estudiante A',
            content: 'Las redes sociales han transformado la forma en que nos comunicamos globalmente. Entre sus principales beneficios está la capacidad de conectar personas sin importar distancias, facilitando el intercambio cultural y el acceso a información diversa. Sin embargo, presentan desafíos significativos como la adicción digital, problemas de privacidad y la propagación de desinformación. Para mitigar estos efectos negativos, considero fundamental implementar una mejor educación digital desde edades tempranas, regulaciones más estrictas sobre el manejo de datos personales y promover el uso consciente de estas plataformas.',
            timestamp: '2025-03-25T14:30:00Z'
          },
          {
            id: 2,
            userName: 'Estudiante B',
            content: 'Las redes sociales representan una revolución en nuestra forma de interactuar. Sus beneficios incluyen la democratización de la información, oportunidades para pequeños negocios y la creación de comunidades de apoyo. No obstante, los riesgos son evidentes: polarización social, efectos negativos en la salud mental y la creación de burbujas de filtro. Para contrarrestar estos problemas, sugiero promover la alfabetización mediática, desarrollar herramientas de verificación de hechos más eficientes y establecer espacios digitales que fomenten el diálogo constructivo entre diferentes perspectivas.',
            timestamp: '2025-03-25T14:35:00Z'
          },
          {
            id: 3,
            userName: 'Estudiante C',
            content: 'En mi análisis sobre las redes sociales, identifico como beneficios principales la capacidad de mantener conexiones sociales, el empoderamiento de movimientos sociales y el acceso a recursos educativos. Entre los riesgos más preocupantes están la adicción, el ciberacoso y la manipulación algorítmica de la información. Las medidas que propongo incluyen el desarrollo de interfaces más éticas por parte de las empresas tecnológicas, la implementación de programas educativos sobre uso saludable de la tecnología y la creación de espacios digitales más diversos e inclusivos.',
            timestamp: '2025-03-25T14:40:00Z'
          }
        ];
        
        setReflections(demoData);
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error al cargar reflexiones:', error);
      setError('Error al cargar reflexiones. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };

  // Simular la carga de colaboraciones
  const fetchCollaborations = async () => {
    try {
      // En producción, esto sería una llamada a la API real
      // const response = await fetch(`/api/collaborations?roomId=${roomId}`);
      // const data = await response.json();
      
      // Datos de demostración
      setTimeout(() => {
        const demoData: Collaboration[] = [
          {
            id: 1,
            roomName: 'Sala 1',
            content: 'Después de analizar los beneficios y desafíos de las redes sociales, llegamos a la conclusión de que estas plataformas ofrecen oportunidades sin precedentes para la conexión global y el intercambio de ideas, pero también presentan riesgos significativos que requieren atención.\n\nBeneficios identificados:\n- Facilitan la comunicación instantánea y global.\n- Democratizan el acceso a la información y la expresión.\n- Crean oportunidades económicas a través del marketing digital.\n- Permiten la formación de comunidades de apoyo basadas en intereses compartidos.\n\nRiesgos principales:\n- Problemas de privacidad y seguridad de datos.\n- Efectos negativos en la salud mental (ansiedad, depresión).\n- Difusión de desinformación y noticias falsas.\n- Polarización social y creación de cámaras de eco.\n\nPara mitigar estos efectos negativos, proponemos:\n1. Mejorar la educación digital en todos los niveles educativos.\n2. Desarrollar marcos regulatorios más robustos para las empresas tecnológicas.\n3. Diseñar algoritmos más transparentes y centrados en el bienestar del usuario.\n4. Fomentar prácticas de uso consciente de la tecnología.\n5. Crear herramientas más efectivas para la verificación de información.\n\nEn conclusión, el impacto de las redes sociales depende en gran medida de cómo las utilizamos. Con las medidas adecuadas, podemos maximizar sus beneficios mientras minimizamos sus aspectos negativos.',
            timestamp: '2025-03-25T15:10:00Z',
            participants: ['Estudiante A', 'Estudiante B']
          },
          {
            id: 2,
            roomName: 'Sala 2',
            content: 'En nuestra colaboración, hemos examinado el impacto multidimensional de las redes sociales en la sociedad contemporánea. Coincidimos en que estas plataformas han revolucionado la comunicación humana, pero difieren significativamente en sus efectos según el contexto y modo de uso.\n\nPrincipales beneficios:\n• Conectividad global instantánea que trasciende barreras geográficas\n• Facilitación de movimientos sociales y activismo ciudadano\n• Democratización de la creación y distribución de contenido\n• Oportunidades de emprendimiento y marketing digital accesible\n• Acceso a comunidades de apoyo para grupos minoritarios o personas con intereses específicos\n\nDesafíos críticos:\n• Deterioro de la salud mental asociado al uso excesivo y la comparación social\n• Violaciones de privacidad y explotación comercial de datos personales\n• Propagación de desinformación y manipulación informativa\n• Adicción digital y sus consecuencias en productividad y bienestar\n• Ciberacoso y otros tipos de violencia digital\n\nEstrategias de mitigación propuestas:\n1. Implementación de programas educativos sobre alfabetización digital y mediática\n2. Desarrollo de marcos regulatorios enfocados en transparencia algorítmica\n3. Diseño ético de plataformas que prioricen el bienestar sobre la maximización del tiempo de uso\n4. Creación de espacios digitales que fomenten el diálogo constructivo entre perspectivas diversas\n5. Investigación interdisciplinaria continua sobre los efectos de las tecnologías sociales\n\nConcluimos que el futuro de las redes sociales dependerá de nuestra capacidad colectiva para rediseñarlas y utilizarlas de manera que amplíen nuestro potencial humano en lugar de explotarlo.',
            timestamp: '2025-03-25T15:15:00Z',
            participants: ['Estudiante C', 'Estudiante D']
          }
        ];
        
        setCollaborations(demoData);
      }, 2000);
      
    } catch (error) {
      console.error('Error al cargar colaboraciones:', error);
      setError('Error al cargar colaboraciones. Por favor, intenta de nuevo.');
    }
  };

  // Manejar el envío de retroalimentación
  const handleSendFeedback = (id: number, type: 'reflection' | 'collaboration') => {
    if (!feedbackText[id] || feedbackText[id].trim() === '') {
      alert('Por favor, escribe un comentario antes de enviar');
      return;
    }
    
    // En producción, esto sería una llamada a la API real
    // await fetch('/api/send-feedback', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     type,
    //     id,
    //     feedbackText: feedbackText[id],
    //     userName
    //   })
    // });
    
    // Simular envío exitoso
    console.log(`Enviando retroalimentación para ${type} #${id}: ${feedbackText[id]}`);
    
    // Marcar como enviado
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

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h1>Error</h1>
        <p>{error}</p>
        <button 
          className={styles.button} 
          onClick={() => router.push('/activity-select')}
        >
          Volver a selección de actividades
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fase de Compartir (Share)</h1>
      <p className={styles.timer}>Tiempo restante: {formatTime(timeRemaining)}</p>
      
      <div className={styles.instructionsContainer}>
        <h2 className={styles.subtitle}>Instrucciones</h2>
        <p>
          En esta fase final del proceso Think-Pair-Share, puedes ver las reflexiones individuales y 
          los documentos colaborativos creados por los demás estudiantes. Tómate un tiempo para 
          revisar el trabajo de tus compañeros y proporcionar retroalimentación constructiva.
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
                      Participantes: {collab.participants.join(', ')}
                    </p>
                    <p className={styles.cardTimestamp}>
                      {new Date(collab.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className={styles.cardContent}>
                    {expandedCollaboration === collab.id ? (
                      <div className={styles.formattedContent}>
                        {collab.content.split('\n').map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    ) : (
                      <p>{collab.content.substring(0, 200)}...
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
}*/
// src/app/share/page.tsx
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