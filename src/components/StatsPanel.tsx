'use client';

import { useState, useEffect } from 'react';
import { getConfigurationStats } from '@/services/tps-config.service';
import styles from '@/app/admin/adminPage.module.css';

interface StatsPanelProps {
  configId: number;
  onBack: () => void;
}

interface StatsData {
  totalSessions: number;
  totalStudents: number;
  avgThinkTime: number;
  avgPairTime: number;
  avgShareTime: number;
  completionRate: number;
  // Puedes añadir más métricas según necesites
}

export default function StatsPanel({ configId, onBack }: StatsPanelProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
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

    loadStats();
  }, [configId]);

  // Para demostración, usemos datos ficticios si no hay datos reales
  useEffect(() => {
    if (!loading && !stats && !error) {
      // Datos de ejemplo para visualización
      setStats({
        totalSessions: 12,
        totalStudents: 24,
        avgThinkTime: 13.5, // minutos
        avgPairTime: 18.2, // minutos
        avgShareTime: 8.7, // minutos
        completionRate: 0.875 // 87.5%
      });
    }
  }, [loading, stats, error]);

  if (loading) {
    return <div className={styles.loading}>Cargando estadísticas...</div>;
  }

  return (
    <div className={styles.statsContainer}>
      <h2 className={styles.subtitle}>Estadísticas de la Actividad</h2>

      {error && (
        <div className={`${styles.message} ${styles.error}`}>
          {error}
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

          <div className={styles.statsSectionNote}>
            <p>Nota: Para obtener estadísticas más detalladas, puede descargar los datos en formato CSV.</p>
          </div>

          <div className={styles.statsActions}>
            <button 
              onClick={() => alert('Función de exportación aún no implementada')} 
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