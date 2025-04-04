
'use client';

import styles from './styles.module.css';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useRooms from './pair/useRooms';

interface Room {
  id: string | number;
  name: string;
}

export default function Page() {
  const [userName, setUserName] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedRoomName, setSelectedRoomName] = useState('');
  const [formError, setFormError] = useState('');
  const router = useRouter();
  const { rooms, loading, error } = useRooms();
  console.log("Rooms from useRooms:", rooms);

  useEffect(() => {
    if (error) {
      setFormError('Error al cargar las salas: ' + (typeof error === 'string' ? error : error instanceof Error ? error.message : 'Unknown error'));
    } else {
      setFormError('');
    }
  }, [error]);

  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
  
    if (!selectedRoomId) {
      setFormError('Por favor, selecciona una sala.');
      return;
    }
  
    try {
      const response = await fetch('/api/registrar-sesion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: selectedRoomId,
          roomName: selectedRoomName,
          userName: userName
        }),
      });
  
      if (!response.ok) {
        throw new Error('Error al registrar la sesión');
      }
  
      const data = await response.json();
  
      const encodedUserName = encodeURIComponent(userName);
      const encodedRoomName = encodeURIComponent(selectedRoomName);
      router.push(`/think?alias=${encodedUserName}&roomId=${selectedRoomId}&roomName=${encodedRoomName}`);
    } catch (error) {
      setFormError('Error al registrar la sesión: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  
  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roomId = e.target.value;
    setSelectedRoomId(roomId);
    
    if (rooms && rooms.length > 0) {
      const selectedRoom = rooms.find(room => 
        typeof room.id === 'number' ? room.id === Number(roomId) : room.id === roomId
      );
      console.log("selectedRoom", selectedRoom);
      setSelectedRoomName(selectedRoom ? selectedRoom.name : '');
    } else {
      console.log("No rooms available");
      setSelectedRoomName('');
    }
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
  onChange={handleRoomChange}
  className={styles.select}
  required
  disabled={loading}
>
  <option value="">Selecciona una sala</option>
  {rooms.map((room: Room) => (
    <option key={room.id} value={room.id.toString()}>
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
