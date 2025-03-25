'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import styles from './studentLogin.module.css';

export default function StudentLoginPage() {
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

      // Autenticar al estudiante con Moodle
      const moodleUrl = process.env.NEXT_PUBLIC_MOODLE_URL || 'http://localhost:8888/moodle401';
      const tokenUrl = `${moodleUrl}/login/token.php`;
      
      const loginResponse = await fetch('/api/moodle/student-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
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
        Cookies.set('studentMoodleToken', loginData.token, { secure: true, sameSite: 'strict' });
        
        // Guardar el username y email para identificar al estudiante
        Cookies.set('studentUsername', userData.username, { secure: true, sameSite: 'strict' });
        Cookies.set('studentEmail', email, { secure: true, sameSite: 'strict' });
        Cookies.set('studentFullName', userData.fullname || `${userData.firstname} ${userData.lastname}`, { secure: true, sameSite: 'strict' });
        Cookies.set('studentId', userData.id.toString(), { secure: true, sameSite: 'strict' });
        
        // Redirigir a la página de selección de actividad
        router.push('/activity-select');
      } else {
        throw new Error('No se recibió un token válido');
      }
    } catch (error) {
      console.error('Error en el login de estudiante:', error);
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Acceso para Estudiantes</h1>
      
      <div className={styles.logoContainer}>
        <Image
          src="https://virtual.konradlorenz.edu.co/pluginfile.php/1/theme_school/logo/1724229010/Logo-05.png"
          alt="Logo Konrad Lorenz"
          width={200}
          height={100}
          className={styles.logo}
        />
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Correo electrónico:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
            placeholder="tu.correo@konradlorenz.edu.co"
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
          className={styles.button}
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
}