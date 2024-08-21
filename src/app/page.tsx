/*
      'use client';

import styles from './styles.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useRooms from './pair/useRooms';  // Asegúrate de que la ruta de importación sea correcta

export default function Page() {
  const [userName, setUserName] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [formError, setFormError] = useState('');
  const router = useRouter();
  const { rooms, loading, error } = useRooms();

  useEffect(() => {
    if (error) {
      setFormError('Error al cargar las salas: ' + error);
    } else {
      setFormError('');
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (!selectedRoomId) {
      setFormError('Por favor, selecciona una sala.');
      return;
    }

    console.log('User Name:', userName);
    console.log('Selected Room ID:', selectedRoomId);

    const encodedUserName = encodeURIComponent(userName);
    router.push(`/think?alias=${encodedUserName}&roomId=${selectedRoomId}`);
  };

  const isFormValid = userName.trim() !== '' && selectedRoomId !== '' && !loading;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bienvenid@ a Konrad Think Pair Share</h1>
      <div className={styles.logoContainer}>
      <Image
        src="https://virtual.konradlorenz.edu.co/pluginfile.php/1/theme_school/logo/1724229010/Logo-05.png"
        alt="Logo Konrad Lorenz"
        width={200}
        height={100}
        className={styles.logo}
      />
     </div>

      <h3 className={styles.title}>Ingresa el usuario que te fue asignado</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Ingresa el usuario"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className={styles.input}
          required
        />
        <select
          value={selectedRoomId}
          onChange={(e) => setSelectedRoomId(e.target.value)}
          className={styles.select}
          required
          disabled={loading}
        >
          <option value="">Selecciona una sala</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
        <button 
          type="submit" 
          className={styles.button}
          disabled={!isFormValid}
        >
          Ingresar a la sala
        </button>
      </form>
      {formError && <p className={styles.error}>{formError}</p>}
      {loading && <p>Cargando salas...</p>}
    </div>
  );
}*/
'use client';

import styles from './styles.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useRooms from './pair/useRooms';

export default function Page() {
  const [userName, setUserName] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [formError, setFormError] = useState('');
  const router = useRouter();
  const { rooms, loading, error } = useRooms();

  useEffect(() => {
    if (error) {
      setFormError('Error al cargar las salas: ' + error);
    } else {
      setFormError('');
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (!selectedRoomId) {
      setFormError('Por favor, selecciona una sala.');
      return;
    }

    const encodedUserName = encodeURIComponent(userName);
    router.push(`/think?alias=${encodedUserName}&roomId=${selectedRoomId}`);
  };

  const isFormValid = userName.trim() !== '' && selectedRoomId !== '' && !loading;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bienvenid@ a Konrad Think Pair Share</h1>
      <div className={styles.logoContainer}>
        <Image
          src="https://virtual.konradlorenz.edu.co/pluginfile.php/1/theme_school/logo/1724229010/Logo-05.png"
          alt="Logo Konrad Lorenz"
          width={200}
          height={100}
          className={styles.logo}
        />
      </div>
      

      <h3 className={styles.subtitle}>Ingresa el usuario que te fue asignado</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Ingresa el usuario"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className={styles.input}
          required
        />
        <select
          value={selectedRoomId}
          onChange={(e) => setSelectedRoomId(e.target.value)}
          className={styles.select}
          required
          disabled={loading}
        >
          <option value="">Selecciona una sala</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className={styles.button}
          disabled={!isFormValid}
        >
          Ingresar a la sala
        </button>
      </form>
      {formError && <p className={styles.error}>{formError}</p>}
      {loading && <p className={styles.loading}>Cargando salas...</p>}
    </div>
  );
}