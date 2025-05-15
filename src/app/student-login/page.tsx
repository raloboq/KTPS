/*'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import styles from './studentLogin.module.css';

export default function StudentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const router = useRouter();

  // Verificar si estamos en modo demo
  useEffect(() => {
    const checkDemoMode = async () => {
      try {
        const response = await fetch('/api/demo-check');
        if (response.ok) {
          const data = await response.json();
          setIsDemoMode(data.isDemoMode);
        }
      } catch (error) {
        console.error('Error al verificar modo demo:', error);
      }
    };

    checkDemoMode();
  }, []);

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
          username: userData.username || email,
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
        Cookies.set('studentMoodleToken', loginData.token, { secure: false, sameSite: 'strict' });
        
        // Guardar el username y email para identificar al estudiante
        Cookies.set('studentUsername', userData.username || email.split('@')[0], { secure: false, sameSite: 'strict' });
        Cookies.set('studentEmail', email, { secure: false, sameSite: 'strict' });
        Cookies.set('studentFullName', userData.fullname || `Estudiante Demo`, { secure: false, sameSite: 'strict' });
        Cookies.set('studentId', userData.id.toString(), { secure: false, sameSite: 'strict' });
        
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

      {isDemoMode && (
        <div className={styles.demoInfoBox}>
          <h3>Modo Demostración Activo</h3>
          <p>Para iniciar sesión, puedes usar:</p>
          <ul>
            <li><strong>Email:</strong> estudiante1@demo.com</li>
            <li><strong>Contraseña:</strong> password123</li>
          </ul>
          <p className={styles.demoNote}>En modo demo, cualquier email que termine en @demo.com será aceptado.</p>
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
            placeholder={isDemoMode ? "estudiante1@demo.com" : "tu.correo@konradlorenz.edu.co"}
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
            placeholder={isDemoMode ? "password123" : "••••••••"}
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
}*/
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import styles from './studentLogin.module.css';

export default function StudentLoginPage() {
  const [identifier, setIdentifier] = useState(''); // Cambiamos de "email" a "identifier"
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const router = useRouter();

  // Verificar si estamos en modo demo
  useEffect(() => {
    const checkDemoMode = async () => {
      try {
        const response = await fetch('/api/demo-check');
        if (response.ok) {
          const data = await response.json();
          setIsDemoMode(data.isDemoMode);
        }
      } catch (error) {
        console.error('Error al verificar modo demo:', error);
      }
    };

    checkDemoMode();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Determinar si es email o username directo
      const isEmail = identifier.includes('@');
      
      let userData;
      
      if (isEmail) {
        // Si es email, buscar el usuario como antes
        const findUserResponse = await fetch('/api/moodle/find-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: identifier }),
        });

        userData = await findUserResponse.json();

        if (userData.error) {
          throw new Error(userData.error);
        }
      } else {
        // Si es username directo (código de estudiante), usarlo directamente
        userData = {
          username: identifier,
          id: null, // No conocemos el ID aún
          fullname: null, // No conocemos el nombre completo
          email: null // No conocemos el email
        };
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
          username: userData.username || identifier, // Usar username si lo tenemos, o el identificador original
          password,
          service: 'moodle_mobile_app',
          url: tokenUrl,
          isDirectUsername: !isEmail // Indicar si el usuario ingresó directamente su username
        }),
      });

      const loginData = await loginResponse.json();

      if (loginData.error) {
        throw new Error(loginData.error);
      }

      if (loginData.token) {
        // Guardar el token en una cookie
        Cookies.set('studentMoodleToken', loginData.token, { secure: false, sameSite: 'strict' });
        
        // Guardar datos del estudiante
        let usernameToStore = userData.username || identifier;
        let fullnameToStore = userData.fullname || 'Estudiante';
        let emailToStore = userData.email || '';
        let studentIdToStore = userData.id ? userData.id.toString() : '';
        
        Cookies.set('studentUsername', usernameToStore, { secure: false, sameSite: 'strict' });
        Cookies.set('studentFullName', fullnameToStore, { secure: false, sameSite: 'strict' });
        Cookies.set('studentEmail', emailToStore, { secure: false, sameSite: 'strict' });
        Cookies.set('studentId', studentIdToStore, { secure: false, sameSite: 'strict' });
        
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

      {isDemoMode && (
        <div className={styles.demoInfoBox}>
          <h3>Modo Demostración Activo</h3>
          <p>Para iniciar sesión, puedes usar:</p>
          <ul>
            <li><strong>Código de estudiante:</strong> 506241130</li>
            <li><strong>O email:</strong> estudiante1@demo.com</li>
            <li><strong>Contraseña:</strong> password123</li>
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          {/* Cambiamos la etiqueta y el placeholder */}
          <label htmlFor="identifier">Código de estudiante o correo electrónico:</label>
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={styles.input}
            required
            placeholder="Código o correo electrónico"
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
            placeholder={isDemoMode ? "password123" : "••••••••"}
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