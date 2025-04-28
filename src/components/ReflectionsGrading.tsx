// src/components/ReflectionsGrading.tsx
'use client';

import { useState, useEffect, JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, Key } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/admin/adminPage.module.css';
import { getConfigurationById } from '@/services/tps-config.service';

interface GradeData {
  reflexionId?: number;
  sessionId?: number;
  studentId?: number;
  grade: number;
  comment?: string;
  isCollaborative: boolean;
}

export default function ReflectionsGrading({ configId }: { configId: number }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'individual' | 'collaborative'>('individual');
  const [gradeForm, setGradeForm] = useState<GradeData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/admin/reflections/${configId}`);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${await response.text()}`);
        }
        
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Error al cargar datos');
        }
      } catch (err) {
        console.error('Error al cargar reflexiones:', err);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [configId]);

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gradeForm) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/admin/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configId,
          ...gradeForm,
          moodleAssignmentId: data?.activity?.moodle_assignment_id || null
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess(`Calificación guardada exitosamente. ${result.moodleSync?.message || ''}`);
        
        // Recargar los datos para mostrar la nueva calificación
        const updatedData = await fetch(`/api/admin/reflections/${configId}`);
        const updatedResult = await updatedData.json();
        
        if (updatedResult.success) {
          setData(updatedResult.data);
        }
        
        // Cerrar el formulario de calificación
        setGradeForm(null);
      } else {
        setError(result.error || 'Error al guardar calificación');
      }
    } catch (err) {
      console.error('Error al guardar calificación:', err);
      setError('Error al guardar calificación. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!gradeForm) return;
    
    const { name, value } = e.target;
    setGradeForm({
      ...gradeForm,
      [name]: name === 'grade' ? parseFloat(value) : value
    });
  };

  const openGradeForm = (
    isCollaborative: boolean, 
    sessionId?: number, 
    reflexionId?: number, 
    studentId?: number,
    currentGrade?: number,
    currentComment?: string
  ) => {
    setGradeForm({
      sessionId,
      reflexionId,
      studentId,
      grade: currentGrade || 0,
      comment: currentComment || '',
      isCollaborative
    });
  };

  if (loading && !data) {
    return <div className={styles.loadingSpinner}>Cargando reflexiones...</div>;
  }

  if (error && !data) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

  if (!data || !data.sessions || data.sessions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>No hay datos disponibles</h3>
        <p>No se encontraron sesiones o reflexiones para esta configuración.</p>
      </div>
    );
  }

  return (
    <div className={styles.gradingContainer}>
      <h2 className={styles.gradingTitle}>
        Calificación de Actividad: {data.activity?.activity_name || 'TPS Activity'}
      </h2>
      
      <div className={styles.activityInfo}>
        <p><strong>Curso:</strong> {data.activity?.course_name || 'N/A'}</p>
        <p><strong>Asignación:</strong> {data.activity?.assignment_name || 'N/A'}</p>
        <p><strong>Descripción:</strong> {data.activity?.activity_description || 'Sin descripción'}</p>
      </div>
      
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'individual' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('individual')}
        >
          Reflexiones Individuales
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'collaborative' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('collaborative')}
        >
          Trabajos Colaborativos
        </button>
      </div>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}
      
      {activeTab === 'individual' && (
        <div className={styles.individualReflections}>
          <h3>Reflexiones Individuales</h3>
          
          <table className={styles.gradingTable}>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Fecha</th>
                <th>Reflexión</th>
                <th>Calificación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.sessions.flatMap((session: { participants: any[]; }) => 
                session.participants
                  .filter((p: { reflexion: any; }) => p.reflexion)
                  .map((participant: { userName: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; reflexion: { id: number | undefined; createdAt: string | number | Date; content: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; calificacion: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | PromiseLikeOfReactNode | null | undefined; comentario: string | undefined; }; id: number | undefined; }) => (
                    <tr key={`${participant.userName}-${participant.reflexion.id}`}>
                      <td>{participant.userName}</td>
                      <td>{new Date(participant.reflexion.createdAt).toLocaleString()}</td>
                      <td>
                        <div className={styles.reflectionContent}>
                          {participant.reflexion.content}
                        </div>
                      </td>
                      <td>
                        {participant.reflexion.calificacion !== null 
                          ? participant.reflexion.calificacion 
                          : 'Sin calificar'}
                      </td>
                      <td>
                        <button 
                          className={styles.gradeButton}
                          onClick={() => openGradeForm(
                            false, 
                            undefined, 
                            participant.reflexion.id,
                            participant.id,
                            typeof participant.reflexion.calificacion === 'number' ? participant.reflexion.calificacion : undefined,
                            participant.reflexion.comentario
                          )}
                        >
                          {participant.reflexion.calificacion !== null ? 'Editar Nota' : 'Calificar'}
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
          
          {data.sessions.flatMap((s: { participants: any; }) => s.participants).filter((p: { reflexion: any; }) => p.reflexion).length === 0 && (
            <div className={styles.emptyState}>
              <p>No hay reflexiones individuales disponibles.</p>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'collaborative' && (
        <div className={styles.collaborativeWorks}>
          <h3>Trabajos Colaborativos</h3>
          
          {data.sessions.map((session: { id: Key | null | undefined; tema: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; startedAt: string | number | Date; endedAt: string | number | Date; participants: any[]; calificacion: { nota: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | PromiseLikeOfReactNode | null | undefined; comentario: string | undefined; }; collaboration: { content: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }; }) => (
            <div key={session.id} className={styles.collaborationCard}>
              <div className={styles.collaborationHeader}>
                <h4>Sala: {session.tema}</h4>
                <p>
                  <strong>Fecha:</strong> {new Date(session.startedAt).toLocaleString()}
                  {session.endedAt && ` - ${new Date(session.endedAt).toLocaleString()}`}
                </p>
                <p>
                  <strong>Participantes:</strong> {session.participants.map((p: { userName: any; }) => p.userName).join(', ')}
                </p>
                <p>
                  <strong>Calificación:</strong> {session.calificacion ? session.calificacion.nota : 'Sin calificar'}
                </p>
              </div>
              
              {session.collaboration && (
                <div className={styles.collaborationContent}>
                  <h5>Contenido Colaborativo:</h5>
                  <div className={styles.contentBox}>
                    {session.collaboration.content}
                  </div>
                  
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.gradeButton}
                      onClick={() => openGradeForm(
                        true, 
                        typeof session.id === 'number' ? session.id : undefined, 
                        undefined,
                        undefined,
                        typeof session.calificacion?.nota === 'number' ? session.calificacion.nota : undefined,
                        session.calificacion?.comentario
                      )}
                    >
                      {session.calificacion ? 'Editar Nota' : 'Calificar'}
                    </button>
                  </div>
                </div>
              )}
              
              {!session.collaboration && (
                <div className={styles.emptyCollaboration}>
                  <p>No hay contenido colaborativo disponible para esta sesión.</p>
                </div>
              )}
            </div>
          ))}
          
          {data.sessions.length === 0 && (
            <div className={styles.emptyState}>
              <p>No hay trabajos colaborativos disponibles.</p>
            </div>
          )}
        </div>
      )}
      
      {gradeForm && (
        <div className={styles.gradeFormOverlay}>
          <div className={styles.gradeForm}>
            <h3>
              {gradeForm.isCollaborative 
                ? 'Calificar Trabajo Colaborativo' 
                : 'Calificar Reflexión Individual'}
            </h3>
            
            <form onSubmit={handleGradeSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="grade">Calificación (0-10):</label>
                <input
                  type="number"
                  id="grade"
                  name="grade"
                  min="0"
                  max="10"
                  step="0.1"
                  value={gradeForm.grade}
                  onChange={handleGradeChange}
                  required
                  className={styles.gradeInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="comment">Comentario (opcional):</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={gradeForm.comment}
                  onChange={handleGradeChange}
                  className={styles.commentInput}
                  rows={4}
                />
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  onClick={() => setGradeForm(null)}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar Calificación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}