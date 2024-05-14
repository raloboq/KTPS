'use server';

import { useEffect, useState } from 'react';

export default function RoomProviderDB({ children }) {
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    const fetchRoomId = async () => {
      try {
        const response = await fetch('/api/getRoomId');
        const data = await response.json();
        if (response.ok) {
          setRoomId(data.roomId);
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error('Error fetching room ID:', err);
      }
    };

    fetchRoomId();
  }, []);

  return <main roomId={roomId}>{children}</main>;
}