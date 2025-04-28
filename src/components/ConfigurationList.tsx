/*
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TPSConfigurationWithDetails } from '@/types/models';
import { getUserConfigurations, toggleConfigurationStatus, generateAccessLink } from '@/services/tps-config.service';
import styles from '@/app/admin/adminPage.module.css';
import ActivityManagement from './ActivityManagement';

interface ConfigListProps {
  onEditConfig: (configId: number) => void;
  onViewStats: (configId: number) => void;
}

export default function ConfigurationList({ onEditConfig, onViewStats }: ConfigListProps) {
  const [configurations, setConfigurations] = useState<TPSConfigurationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [accessLink, setAccessLink] = useState<string | null>(null);
  const [expandedActivityConfig, setExpandedActivityConfig] = useState<number | null>(null);
  const router = useRouter();

  // Cargar configuraciones
  const loadConfigurations = async () => {
    setLoading(true);
    try {
      const response = await getUserConfigurations();
      if (response.success) {
        setConfigurations(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Error al cargar configuraciones');
      }
    } catch (error) {
      setError('Error de conexión al cargar configuraciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  // Cambiar estado de activación
  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await toggleConfigurationStatus(id, !currentStatus);
      if (response.success) {
        setMessage(`Configuración ${!currentStatus ? 'activada' : 'desactivada'} correctamente`);
        loadConfigurations(); // Recargar la lista
        
        // Si se está activando, expandir la gestión de actividad
        if (!currentStatus) {
          setExpandedActivityConfig(id);
        }
      } else {
        setError(response.error || 'Error al cambiar estado de la configuración');
      }
    } catch (error) {
      setError('Error de conexión al cambiar estado');
      console.error(error);
    }
  };

  // Generar enlace de acceso
  const handleGenerateLink = async (id: number) => {
    try {
      const response = await generateAccessLink(id);
      if (response.success && response.data) {
        setAccessLink(response.data.link);
      } else {
        setError(response.error || 'Error al generar enlace de acceso');
      }
    } catch (error) {
      setError('Error de conexión al generar enlace');
      console.error(error);
    }
  };

  // Copiar enlace al portapapeles
  const handleCopyLink = () => {
    if (accessLink) {
      navigator.clipboard.writeText(accessLink)
        .then(() => setMessage('Enlace copiado al portapapeles'))
        .catch(() => setError('Error al copiar enlace'));
    }
  };

  // Formatear duración en segundos a minutos
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Alternar despliegue de la gestión de actividad
  const toggleActivityManagement = (configId: number) => {
    setExpandedActivityConfig(expandedActivityConfig === configId ? null : configId);
  };

  if (loading) {
    return <div className={styles.loading}>Cargando configuraciones...</div>;
  }

  return (
    <div className={styles.configListContainer}>
      <h2 className={styles.subtitle}>Mis Configuraciones TPS</h2>
      
      {error && (
        <div className={`${styles.message} ${styles.error}`}>
          {error}
        </div>
      )}
      
      {message && (
        <div className={`${styles.message} ${styles.success}`}>
          {message}
        </div>
      )}
      
      {accessLink && (
        <div className={styles.linkContainer}>
          <h3 className={styles.linkTitle}>Enlace de acceso para estudiantes:</h3>
          <div className={styles.linkBox}>
            <input
              type="text"
              readOnly
              value={accessLink}
              className={styles.linkInput}
            />
            <button
              onClick={handleCopyLink}
              className={styles.copyButton}
            >
              Copiar
            </button>
          </div>
          <p className={styles.linkInstructions}>
            Comparte este enlace con tus estudiantes para que accedan a la actividad TPS.
          </p>
        </div>
      )}
      
      {configurations.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No tienes configuraciones TPS creadas.</p>
          <p>¡Crea tu primera configuración utilizando el formulario!</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.configTable}>
            <thead>
              <tr>
                <th>Curso</th>
                <th>Actividad</th>
                <th>Think</th>
                <th>Pair</th>
                <th>Share</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {configurations.map((config) => (
                <React.Fragment key={config.id}>
                  <tr className={config.is_active ? styles.activeRow : ''}>
                    <td>{config.course_name}</td>
                    <td>{config.assignment_name}</td>
                    <td>{formatDuration(config.think_phase_duration)}</td>
                    <td>{formatDuration(config.pair_phase_duration)}</td>
                    <td>{formatDuration(config.share_phase_duration)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${config.is_active ? styles.statusActive : styles.statusInactive}`}>
                        {config.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>{formatDate(config.created_at)}</td>
                    <td className={styles.actionButtons}>
                      <button 
                        onClick={() => onEditConfig(config.id)}
                        className={styles.editButton}
                        title="Editar configuración"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(config.id, config.is_active)}
                        className={config.is_active ? styles.deactivateButton : styles.activateButton}
                        title={config.is_active ? 'Desactivar configuración' : 'Activar configuración'}
                      >
                        {config.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      {config.is_active && (
                        <>
                          <button 
                            onClick={() => toggleActivityManagement(config.id)}
                            className={styles.linkButton}
                            title="Administrar actividad"
                          >
                            {expandedActivityConfig === config.id ? 'Cerrar config' : 'Config. actividad'}
                          </button>
                          <button 
                            onClick={() => handleGenerateLink(config.id)}
                            className={styles.linkButton}
                            title="Generar enlace de acceso"
                          >
                            Generar Enlace
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => onViewStats(config.id)}
                        className={styles.statsButton}
                        title="Ver estadísticas"
                      >
                        Estadísticas
                      </button>
                    </td>
                  </tr>
                  {expandedActivityConfig === config.id && (
                    <tr>
                      <td colSpan={8} className={styles.activityManagementCell}>
                      <ActivityManagement configId={config.id} isActive={config.is_active} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
  */
 'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TPSConfigurationWithDetails } from '@/types/models';
import { getUserConfigurations, toggleConfigurationStatus, generateAccessLink } from '@/services/tps-config.service';
import styles from '@/app/admin/adminPage.module.css';
import ActivityManagement from './ActivityManagement';

interface ConfigListProps {
  onEditConfig: (configId: number) => void;
  onViewStats: (configId: number) => void;
  onViewGrading: (configId: number) => void;
}

export default function ConfigurationList({ onEditConfig, onViewStats, onViewGrading }: ConfigListProps) {
  const [configurations, setConfigurations] = useState<TPSConfigurationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [accessLink, setAccessLink] = useState<string | null>(null);
  const [expandedActivityConfig, setExpandedActivityConfig] = useState<number | null>(null);
  const router = useRouter();

  // Cargar configuraciones
  const loadConfigurations = async () => {
    setLoading(true);
    try {
      const response = await getUserConfigurations();
      if (response.success) {
        setConfigurations(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Error al cargar configuraciones');
      }
    } catch (error) {
      setError('Error de conexión al cargar configuraciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  // Cambiar estado de activación
  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await toggleConfigurationStatus(id, !currentStatus);
      if (response.success) {
        setMessage(`Configuración ${!currentStatus ? 'activada' : 'desactivada'} correctamente`);
        loadConfigurations(); // Recargar la lista
        
        // Si se está activando, expandir la gestión de actividad
        if (!currentStatus) {
          setExpandedActivityConfig(id);
        }
      } else {
        setError(response.error || 'Error al cambiar estado de la configuración');
      }
    } catch (error) {
      setError('Error de conexión al cambiar estado');
      console.error(error);
    }
  };

  // Generar enlace de acceso
  const handleGenerateLink = async (id: number) => {
    try {
      const response = await generateAccessLink(id);
      if (response.success && response.data) {
        setAccessLink(response.data.link);
      } else {
        setError(response.error || 'Error al generar enlace de acceso');
      }
    } catch (error) {
      setError('Error de conexión al generar enlace');
      console.error(error);
    }
  };

  // Copiar enlace al portapapeles
  const handleCopyLink = () => {
    if (accessLink) {
      navigator.clipboard.writeText(accessLink)
        .then(() => setMessage('Enlace copiado al portapapeles'))
        .catch(() => setError('Error al copiar enlace'));
    }
  };

  // Formatear duración en segundos a minutos
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Alternar despliegue de la gestión de actividad
  const toggleActivityManagement = (configId: number) => {
    setExpandedActivityConfig(expandedActivityConfig === configId ? null : configId);
  };

  if (loading) {
    return <div className={styles.loading}>Cargando configuraciones...</div>;
  }

  return (
    <div className={styles.configListContainer}>
      <h2 className={styles.subtitle}>Mis Configuraciones TPS</h2>
      
      {error && (
        <div className={`${styles.message} ${styles.error}`}>
          {error}
        </div>
      )}
      
      {message && (
        <div className={`${styles.message} ${styles.success}`}>
          {message}
        </div>
      )}
      
      {accessLink && (
        <div className={styles.linkContainer}>
          <h3 className={styles.linkTitle}>Enlace de acceso para estudiantes:</h3>
          <div className={styles.linkBox}>
            <input
              type="text"
              readOnly
              value={accessLink}
              className={styles.linkInput}
            />
            <button
              onClick={handleCopyLink}
              className={styles.copyButton}
            >
              Copiar
            </button>
          </div>
          <p className={styles.linkInstructions}>
            Comparte este enlace con tus estudiantes para que accedan a la actividad TPS.
          </p>
        </div>
      )}
      
      {configurations.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No tienes configuraciones TPS creadas.</p>
          <p>¡Crea tu primera configuración utilizando el formulario!</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.configTable}>
            <thead>
              <tr>
                <th>Curso</th>
                <th>Actividad</th>
                <th>Think</th>
                <th>Pair</th>
                <th>Share</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {configurations.map((config) => (
                <React.Fragment key={config.id}>
                  <tr className={config.is_active ? styles.activeRow : ''}>
                    <td>{config.course_name}</td>
                    <td>{config.assignment_name}</td>
                    <td>{formatDuration(config.think_phase_duration)}</td>
                    <td>{formatDuration(config.pair_phase_duration)}</td>
                    <td>{formatDuration(config.share_phase_duration)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${config.is_active ? styles.statusActive : styles.statusInactive}`}>
                        {config.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>{formatDate(config.created_at)}</td>
                    <td className={styles.actionButtons}>
                      <button 
                        onClick={() => onEditConfig(config.id)}
                        className={styles.editButton}
                        title="Editar configuración"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(config.id, config.is_active)}
                        className={config.is_active ? styles.deactivateButton : styles.activateButton}
                        title={config.is_active ? 'Desactivar configuración' : 'Activar configuración'}
                      >
                        {config.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      {config.is_active && (
                        <>
                          <button 
                            onClick={() => toggleActivityManagement(config.id)}
                            className={styles.linkButton}
                            title="Administrar actividad"
                          >
                            {expandedActivityConfig === config.id ? 'Cerrar config' : 'Config. actividad'}
                          </button>
                          <button 
                            onClick={() => handleGenerateLink(config.id)}
                            className={styles.linkButton}
                            title="Generar enlace de acceso"
                          >
                            Generar Enlace
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => onViewStats(config.id)}
                        className={styles.statsButton}
                        title="Ver estadísticas"
                      >
                        Estadísticas
                      </button>
                      <button 
    onClick={() => onViewGrading(config.id)}
    className={styles.gradingButton || styles.linkButton} // Usar el estilo existente o uno nuevo
    title="Calificar reflexiones"
  >
    Calificar
  </button>
                    </td>
                  </tr>
                  {expandedActivityConfig === config.id && (
                    <tr>
                      <td colSpan={8} className={styles.activityManagementCell}>
                        <ActivityManagement configId={config.id} isActive={config.is_active} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}