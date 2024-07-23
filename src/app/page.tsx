/*
      'use client';

     import styles from './styles.module.css';
      import Link from 'next/link';
      import { useState } from 'react';
      import { useRouter } from 'next/navigation';
      
      export default function Page() {
        const [text1, setText1] = useState('');
        const [text2, setText2] = useState('');
        const router = useRouter();
      
        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          console.log('Text 1:', text1);
          console.log('Text 2:', text2);
          
          // Encode the text to ensure special characters are properly handled in the URL
          const encodedText1 = encodeURIComponent(text1);
          router.push(`/think?alias=${encodedText1}`);
        };
      
        return (
          <div className={styles.container}>
            <h1 className={styles.title}>Bienvenid@ a Konrad Think Pair Share</h1>
            <Link href="/think" className={styles.link}>Think</Link>

            <h3 className={styles.title}>Ingresa el usuario que te fue asignado</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                placeholder="Enter text 1"
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Enter text 2"
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                className={styles.input}
              />
              <button type="submit" className={styles.button}>Submit</button>
            </form>
          </div>
        );
      }
        */
      'use client';

import styles from './styles.module.css';
import Link from 'next/link';
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
      <Link href="/think" className={styles.link}>Think</Link>

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
}