// src/lib/db.ts
import { Pool } from 'pg';

// Configuración del pool de conexiones reutilizable para toda la aplicación
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 20, // número máximo de clientes en el pool
  idleTimeoutMillis: 30000, // cuánto tiempo esperar antes de terminar un cliente inactivo
  connectionTimeoutMillis: 2000, // cuánto tiempo esperar al intentar conectar
  maxUses: 7500, // número máximo de consultas a ejecutar antes de terminar una conexión
});

// Añadir listeners para depuración y monitoreo
pool.on('connect', () => {
  console.log('Nueva conexión a la base de datos establecida');
});

pool.on('error', (err, client) => {
  console.error('Error inesperado en el cliente del pool', err);
});

// Exportar el pool para uso en toda la aplicación
export { pool };

// Función auxiliar para ejecutar consultas más fácilmente
export async function query(text: string, params: any[] = []) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    throw error;
  }
}

// Función auxiliar para ejecutar consultas con reintentos automáticos
export async function executeWithRetry(queryFn: () => Promise<any>, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error: any) {
      lastError = error;
      
      // Solo reintentar para ciertos tipos de errores (códigos de conexión)
      const retryableCodes = ['ECONNREFUSED', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST', 'ENOTFOUND'];
      if (!retryableCodes.includes(error.code)) {
        throw error;
      }
      
      console.warn(`Intento ${attempt} fallido: ${error.message}. Reintentando...`);
      
      // Esperar un tiempo antes de reintentar (con backoff exponencial)
      await new Promise(r => setTimeout(r, 100 * Math.pow(2, attempt)));
    }
  }
  
  throw lastError;
}