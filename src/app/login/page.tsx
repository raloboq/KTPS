'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../admin/adminPage.module.css';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Primero obtenemos el username a partir del correo
      const findUserResponse = await fetch('/api/moodle/find-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const userData = await findUserResponse.json();

      if (userData.error) {
        throw new Error(userData.error);
      }

      if (!userData.username) {
        throw new Error('No se encontró ningún usuario con ese correo electrónico');
      }

      const username = userData.username;
      
      // Ahora hacemos login con el username obtenido
      const moodleUrl = process.env.NEXT_PUBLIC_MOODLE_URL || 'http://localhost:8888/moodle401';
      const tokenUrl = `${moodleUrl}/login/token.php`;
      
      const loginResponse = await fetch('/api/moodle/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          service: 'moodle_mobile_app',
          url: tokenUrl
        }),
      });

      const loginData = await loginResponse.json();

      if (loginData.error) {
        throw new Error(loginData.error);
      }

      if (loginData.token) {
        // Guardar el token en una cookie
        Cookies.set('moodleToken', loginData.token, { secure: true, sameSite: 'strict' });
        
        // Guardar el username y email para saber qué profesor está logueado
        Cookies.set('moodleUsername', username, { secure: true, sameSite: 'strict' });
        Cookies.set('moodleEmail', email, { secure: true, sameSite: 'strict' });
        Cookies.set('moodleFullName', userData.fullname || `${userData.firstname} ${userData.lastname}`, { secure: true, sameSite: 'strict' });
        
        // Guardar el ID de usuario de Moodle en las cookies
        Cookies.set('moodleUserId', userData.id.toString(), { secure: true, sameSite: 'strict' });
        
        // Redirigir a la página de selección de curso
        router.push('/course-select');
      } else {
        throw new Error('No se recibió un token válido');
      }
    } catch (error) {
      console.error('Error en el login:', error);
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login de Profesores</h1>
      
      {error && (
        <div className={`${styles.message} ${styles.error}`}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Correo electrónico:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
            placeholder="ejemplo@dominio.com"
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Contraseña:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.saveButton}
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
}