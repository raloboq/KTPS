/*'use client';

import { useState, useEffect } from 'react';
import { getConfigurationStats } from '@/services/tps-config.service';
import styles from '@/app/admin/adminPage.module.css';
import { useRouter } from 'next/navigation';

interface StatsPanelProps {
  configId: number;
  onBack: () => void;
}

interface PhaseStats {
  think: {
    averageLength: number;
    participationRate: number;
    mostCommonTopic: string;
  };
  pair: {
    averageCollaborationTime: number;
    messageCount: number;
    documentChanges: number;
  };
  share: {
    presentationLength: number;
    feedbackCount: number;
  };
}

interface TimeDistribution {
  phase: string;
  percentage: number;
}

interface StatsData {
  totalSessions: number;
  totalStudents: number;
  avgThinkTime: number;
  avgPairTime: number;
  avgShareTime: number;
  completionRate: number;
  phaseStats?: PhaseStats;
  timeDistribution?: TimeDistribution[];
}

export default function StatsPanel({ configId, onBack }: StatsPanelProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Cargando estadísticas para configuración ID:', configId);
        const response = await getConfigurationStats(configId);
        console.log('Respuesta de estadísticas:', response);
        
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          console.error('Error en respuesta de estadísticas:', response.error);
          setError(response.error || 'Error al cargar estadísticas');
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        setError('Error de conexión al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [configId]);

  const handleRetry = () => {
    setStats(null);
    loadStats();
  };

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getConfigurationStats(configId);
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'Error al cargar estadísticas');
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setError('Error de conexión al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    // En una implementación real, esto descargaría un archivo CSV
    alert('Funcionalidad de exportación de datos en desarrollo');
  };

  if (loading) {
    return <div className={styles.loading}>Cargando estadísticas...</div>;
  }

  return (
    <div className={styles.statsContainer}>
      <h2 className={styles.subtitle}>Estadísticas de la Actividad</h2>

      {error && (
        <div className={`${styles.message} ${styles.error}`}>
          <p>{error}</p>
          <button 
            onClick={handleRetry}
            className={styles.retryButton}
          >
            Reintentar
          </button>
        </div>
      )}

      {stats && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalSessions}</div>
              <div className={styles.statLabel}>Sesiones Totales</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalStudents}</div>
              <div className={styles.statLabel}>Estudiantes Participantes</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{(stats.completionRate * 100).toFixed(1)}%</div>
              <div className={styles.statLabel}>Tasa de Finalización</div>
            </div>
          </div>

          <div className={styles.statsSection}>
            <h3 className={styles.statsSectionTitle}>Tiempo Promedio por Fase</h3>
            <div className={styles.timeStats}>
              <div className={styles.timeStat}>
                <div className={styles.timeStatLabel}>Fase Think</div>
                <div className={styles.timeStatValue}>{stats.avgThinkTime.toFixed(1)} min</div>
                <div className={styles.timeStatBar}>
                  <div 
                    className={styles.timeStatBarFill} 
                    style={{ width: `${(stats.avgThinkTime / 15) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className={styles.timeStat}>
                <div className={styles.timeStatLabel}>Fase Pair</div>
                <div className={styles.timeStatValue}>{stats.avgPairTime.toFixed(1)} min</div>
                <div className={styles.timeStatBar}>
                  <div 
                    className={styles.timeStatBarFill} 
                    style={{ width: `${(stats.avgPairTime / 20) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className={styles.timeStat}>
                <div className={styles.timeStatLabel}>Fase Share</div>
                <div className={styles.timeStatValue}>{stats.avgShareTime.toFixed(1)} min</div>
                <div className={styles.timeStatBar}>
                  <div 
                    className={styles.timeStatBarFill} 
                    style={{ width: `${(stats.avgShareTime / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {stats.phaseStats && (
            <div className={styles.statsSection}>
              <h3 className={styles.statsSectionTitle}>Datos por Fase</h3>
              
              <div className={styles.phaseStatsGrid}>
                <div className={styles.phaseStatCard}>
                  <h4>Fase Think</h4>
                  <p><strong>Longitud promedio:</strong> {stats.phaseStats.think.averageLength} caracteres</p>
                  <p><strong>Tasa de participación:</strong> {(stats.phaseStats.think.participationRate * 100).toFixed(1)}%</p>
                  <p><strong>Tema más común:</strong> {stats.phaseStats.think.mostCommonTopic}</p>
                </div>
                
                <div className={styles.phaseStatCard}>
                  <h4>Fase Pair</h4>
                  <p><strong>Tiempo de colaboración:</strong> {stats.phaseStats.pair.averageCollaborationTime.toFixed(1)} min</p>
                  <p><strong>Mensajes promedio:</strong> {stats.phaseStats.pair.messageCount}</p>
                  <p><strong>Cambios en documentos:</strong> {stats.phaseStats.pair.documentChanges}</p>
                </div>
                
                <div className={styles.phaseStatCard}>
                  <h4>Fase Share</h4>
                  <p><strong>Longitud de presentación:</strong> {stats.phaseStats.share.presentationLength} caracteres</p>
                  <p><strong>Retroalimentaciones:</strong> {stats.phaseStats.share.feedbackCount}</p>
                </div>
              </div>
            </div>
          )}

          {stats.timeDistribution && (
            <div className={styles.statsSection}>
              <h3 className={styles.statsSectionTitle}>Distribución del Tiempo</h3>
              
              <div className={styles.timeDistribution}>
                {stats.timeDistribution.map((item, index) => (
                  <div key={index} className={styles.timeDistItem}>
                    <div className={styles.timeDistLabel}>
                      {item.phase}
                    </div>
                    <div className={styles.timeDistBar}>
                      <div 
                        className={styles.timeDistFill}
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: 
                            item.phase === 'Think' ? '#009A93' : 
                            item.phase === 'Pair' ? '#E6007E' : 
                            '#662483'
                        }}
                      ></div>
                    </div>
                    <div className={styles.timeDistPercentage}>
                      {item.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.statsSectionNote}>
            <p>Nota: Estas estadísticas son generadas en base a las sesiones completadas de la actividad.</p>
          </div>

          <div className={styles.statsActions}>
            <button 
              onClick={handleExportData} 
              className={styles.exportButton}
            >
              Exportar Datos (CSV)
            </button>
            <button 
              onClick={onBack} 
              className={styles.backButton}
            >
              Volver
            </button>
          </div>
        </>
      )}
    </div>
  );
}*/
'use client';

import { useState, useEffect } from 'react';
import { getConfigurationStats } from '@/services/tps-config.service';
import styles from '@/app/admin/adminPage.module.css';
import { useRouter } from 'next/navigation';

interface StatsPanelProps {
  configId: number;
  onBack: () => void;
}

interface PhaseStats {
  think: {
    averageLength: number;
    participationRate: number;
    mostCommonTopic: string;
  };
  pair: {
    averageCollaborationTime: number | string; // Permitir string para manejar el caso del API
    messageCount: number;
    documentChanges: number;
    documentLength?: number;
  };
  share: {
    presentationLength: number;
    feedbackCount: number;
  };
}

interface TimeDistribution {
  phase: string;
  percentage: number;
}

interface StatsData {
  totalSessions: number;
  totalStudents: number;
  avgThinkTime: number;
  avgPairTime: number;
  avgShareTime: number;
  completionRate: number;
  phaseStats?: PhaseStats;
  timeDistribution?: TimeDistribution[];
}

export default function StatsPanel({ configId, onBack }: StatsPanelProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const router = useRouter();

  // Cargar estadísticas una sola vez al montar el componente
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Cargando estadísticas para configuración ID:', configId);
        const response = await getConfigurationStats(configId);
        console.log('Respuesta de estadísticas:', response);
        
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          console.error('Error en respuesta de estadísticas:', response.error);
          setError(response.error || 'Error al cargar estadísticas');
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        setError('Error de conexión al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [configId]); // Solo se ejecuta cuando cambia configId

  // Función para reintentar cargar estadísticas
  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    setStats(null);
    
    try {
      const response = await getConfigurationStats(configId);
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'Error al cargar estadísticas');
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setError('Error de conexión al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar datos
  const handleExportData = () => {
    // En una implementación real, esto descargaría un archivo CSV
    alert('Funcionalidad de exportación de datos en desarrollo');
  };

  // Función auxiliar para formatear números
  const formatNumber = (value: number | string): string => {
    if (typeof value === 'string') {
      const parsedValue = parseFloat(value);
      return isNaN(parsedValue) ? '0.0' : parsedValue.toFixed(1);
    }
    return value.toFixed(1);
  };

  if (loading) {
    return <div className={styles.loading}>Cargando estadísticas...</div>;
  }

  return (
    <div className={styles.statsContainer}>
      <h2 className={styles.subtitle}>Estadísticas de la Actividad</h2>

      {error && (
        <div className={`${styles.message} ${styles.error}`}>
          <p>{error}</p>
          <button 
            onClick={handleRetry}
            className={styles.retryButton}
          >
            Reintentar
          </button>
        </div>
      )}

      {stats && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalSessions}</div>
              <div className={styles.statLabel}>Sesiones Totales</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalStudents}</div>
              <div className={styles.statLabel}>Estudiantes Participantes</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{(stats.completionRate * 100).toFixed(1)}%</div>
              <div className={styles.statLabel}>Tasa de Finalización</div>
            </div>
          </div>

          <div className={styles.statsSection}>
            <h3 className={styles.statsSectionTitle}>Tiempo Promedio por Fase</h3>
            <div className={styles.timeStats}>
              <div className={styles.timeStat}>
                <div className={styles.timeStatLabel}>Fase Think</div>
                <div className={styles.timeStatValue}>{formatNumber(stats.avgThinkTime)} min</div>
                <div className={styles.timeStatBar}>
                  <div 
                    className={styles.timeStatBarFill} 
                    style={{ width: `${(stats.avgThinkTime / 15) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className={styles.timeStat}>
                <div className={styles.timeStatLabel}>Fase Pair</div>
                <div className={styles.timeStatValue}>{formatNumber(stats.avgPairTime)} min</div>
                <div className={styles.timeStatBar}>
                  <div 
                    className={styles.timeStatBarFill} 
                    style={{ width: `${(stats.avgPairTime / 20) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className={styles.timeStat}>
                <div className={styles.timeStatLabel}>Fase Share</div>
                <div className={styles.timeStatValue}>{formatNumber(stats.avgShareTime)} min</div>
                <div className={styles.timeStatBar}>
                  <div 
                    className={styles.timeStatBarFill} 
                    style={{ width: `${(stats.avgShareTime / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {stats.phaseStats && (
            <div className={styles.statsSection}>
              <h3 className={styles.statsSectionTitle}>Datos por Fase</h3>
              
              <div className={styles.phaseStatsGrid}>
                <div className={styles.phaseStatCard}>
                  <h4>Fase Think</h4>
                  <p><strong>Longitud promedio:</strong> {stats.phaseStats.think.averageLength} caracteres</p>
                  <p><strong>Tasa de participación:</strong> {(stats.phaseStats.think.participationRate * 100).toFixed(1)}%</p>
                  <p><strong>Tema más común:</strong> {stats.phaseStats.think.mostCommonTopic}</p>
                </div>
                
                <div className={styles.phaseStatCard}>
                  <h4>Fase Pair</h4>
                  <p><strong>Tiempo de colaboración:</strong> {formatNumber(stats.phaseStats.pair.averageCollaborationTime)} min</p>
                  <p><strong>Mensajes promedio:</strong> {stats.phaseStats.pair.messageCount}</p>
                  {/* Cambiar documentChanges por documentLength si ese es el nombre correcto */}
                  <p><strong>Longitud del documento:</strong> {stats.phaseStats.pair.documentLength || stats.phaseStats.pair.documentChanges || 0}</p>
                </div>
                
                <div className={styles.phaseStatCard}>
                  <h4>Fase Share</h4>
                  <p><strong>Longitud de presentación:</strong> {stats.phaseStats.share.presentationLength} caracteres</p>
                  <p><strong>Retroalimentaciones:</strong> {stats.phaseStats.share.feedbackCount}</p>
                </div>
              </div>
            </div>
          )}

          {stats.timeDistribution && (
            <div className={styles.statsSection}>
              <h3 className={styles.statsSectionTitle}>Distribución del Tiempo</h3>
              
              <div className={styles.timeDistribution}>
                {stats.timeDistribution.map((item, index) => (
                  <div key={index} className={styles.timeDistItem}>
                    <div className={styles.timeDistLabel}>
                      {item.phase}
                    </div>
                    <div className={styles.timeDistBar}>
                      <div 
                        className={styles.timeDistFill}
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: 
                            item.phase === 'Think' ? '#009A93' : 
                            item.phase === 'Pair' ? '#E6007E' : 
                            '#662483'
                        }}
                      ></div>
                    </div>
                    <div className={styles.timeDistPercentage}>
                      {item.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.statsSectionNote}>
            <p>Nota: Estas estadísticas son generadas en base a las sesiones completadas de la actividad.</p>
          </div>

          <div className={styles.statsActions}>
            <button 
              onClick={handleExportData} 
              className={styles.exportButton}
            >
              Exportar Datos (CSV)
            </button>
            <button 
              onClick={onBack} 
              className={styles.backButton}
            >
              Volver
            </button>
          </div>
        </>
      )}
    </div>
  );
}