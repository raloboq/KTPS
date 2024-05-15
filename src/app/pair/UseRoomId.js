import { useState, useEffect } from 'react';
import { getExampleRoomId } from '@/lib/getExampleRoomId';

function useRoomId(roomId) {
  const [RoomId, setExampleRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExampleRoomId = async () => {
      try {
        const fetchedExampleRoomId = await getExampleRoomId();
        console.log("aaaa"+fetchedExampleRoomId);
        setExampleRoomId(fetchedExampleRoomId);
      } catch (err) {
        console.log("aaaa"+err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExampleRoomId();
  }, [RoomId]);

  return { RoomId, loading, error };
}

export default useRoomId;