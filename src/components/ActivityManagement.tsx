'use client';

import { useState, useEffect } from 'react';
import styles from '@/app/admin/adminPage.module.css';

interface ActivityManagementProps {
  configId: number;
  isActive: boolean;
}

interface ActivityData {
  id: number | null;
  name: string;
  description: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  isActive: boolean;
}

export default function ActivityManagement({ configId, isActive }: ActivityManagementProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<ActivityData>({
    id: null,
    name: '',
    description: '',
    startDate: new Date().toISOString().substring(0, 16), // Formato: YYYY-MM-DDTHH:MM
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16), // 30 días en el futuro
    isActive: isActive
  });

  // Cargar datos de la actividad asociada a esta configuración
  useEffect(() => {
    const fetchActivityData = async () => {
      if (!configId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/tps-activity/${configId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // Si no se encuentra actividad, dejamos los valores predeterminados
            setLoading(false);
            return;
          }
          throw new Error('Error al cargar datos de la actividad');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setActivityData({
            id: data.data.id,
            name: data.data.name,
            description: data.data.description,
            startDate: new Date(data.data.start_date).toISOString().substring(0, 16),
            endDate: new Date(data.data.end_date).toISOString().substring(0, 16),
            isActive: data.data.is_active
          });
        }
      } catch (error) {
        console.error('Error al cargar datos de actividad:', error);
        setError('Error al cargar datos de la actividad');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [configId]);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setActivityData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enviar los datos actualizados
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`/api/tps-activity/${configId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: activityData.name,
          description: activityData.description,
          start_date: new Date(activityData.startDate).toISOString(),
          end_date: new Date(activityData.endDate).toISOString(),
          is_active: activityData.isActive
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Datos de la actividad actualizados correctamente');
        
        // Actualizar el ID si es una actividad nueva
        if (data.data && data.data.id && !activityData.id) {
          setActivityData(prev => ({
            ...prev,
            id: data.data.id
          }));
        }
      } else {
        setError(data.error || 'Error al guardar los datos de la actividad');
      }
    } catch (error) {
      console.error('Error al guardar datos de actividad:', error);
      setError('Error de conexión al guardar datos');
    } finally {
      setLoading(false);
      
      // Limpiar mensaje de éxito después de 3 segundos
      if (success) {
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  return (
    <div className={styles.configFormContainer}>
      <h3 className={styles.subtitle}>Administración de Actividad</h3>
      
      {error && (
        <div className={`${styles.message} ${styles.error}`}>
          {error}
        </div>
      )}
      
      {success && (
        <div className={`${styles.message} ${styles.success}`}>
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.configForm}>
        <div className={styles.inputGroup}>
          <label htmlFor="name">Nombre de la actividad:</label>
          <input
            id="name"
            name="name"
            type="text"
            value={activityData.name}
            onChange={handleInputChange}
            className={styles.input}
            required
            placeholder="Ej: TPS Fundamentos de Programación"
          />
          <p className={styles.helpText}>
            Este nombre será visible para los estudiantes en la lista de actividades.
          </p>
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="description">Descripción:</label>
          <textarea
            id="description"
            name="description"
            value={activityData.description}
            onChange={handleInputChange}
            rows={3}
            className={styles.textarea}
            required
            placeholder="Describe brevemente la actividad Think-Pair-Share"
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="startDate">Fecha de inicio:</label>
          <input
            id="startDate"
            name="startDate"
            type="datetime-local"
            value={activityData.startDate}
            onChange={handleInputChange}
            className={styles.input}
            required
          />
          <p className={styles.helpText}>
            La actividad estará disponible para los estudiantes a partir de esta fecha.
          </p>
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="endDate">Fecha de finalización:</label>
          <input
            id="endDate"
            name="endDate"
            type="datetime-local"
            value={activityData.endDate}
            onChange={handleInputChange}
            className={styles.input}
            required
          />
          <p className={styles.helpText}>
            Los estudiantes no podrán acceder a la actividad después de esta fecha.
          </p>
        </div>
        
        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar configuración de actividad'}
          </button>
        </div>
      </form>
    </div>
  );
}