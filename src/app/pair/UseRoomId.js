/*import { useState, useEffect } from 'react';
import { getExampleRoomId } from '@/lib/getExampleRoomId';

function useRoomId() {
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

export default useRoomId;*/

import { useState, useEffect } from 'react';
import { getExampleRoomId } from '@/lib/getExampleRoomId';

function useRoomId(userName) {
  const [roomInfo, setRoomInfo] = useState({ id: null, name: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRoomInfo = async () => {
      if (!userName) {
        setLoading(false);
        return;
      }

      try {
        const fetchedRoomInfo = await getExampleRoomId(userName);
        if (isMounted) {
          setRoomInfo(fetchedRoomInfo);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching room info:", err);
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    fetchRoomInfo();

    return () => {
      isMounted = false;
    };
  }, [userName]);

  return { roomInfo, loading, error };
}

export default useRoomId;



/* este no funciona
import { useState, useEffect } from 'react';
import { getExampleRoomId } from '@/lib/getExampleRoomId';

function useRoomId(userName) {
  const [roomInfo, setRoomInfo] = useState({ id: null, name: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomInfo = async () => {
      if (!userName) {
        setError(new Error('userName is required'));
        setLoading(false);
        return;
      }

      try {
        const fetchedRoomInfo = await getExampleRoomId(userName);
        setRoomInfo(fetchedRoomInfo);
      } catch (err) {
        console.error("Error fetching room info:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomInfo();
  }, [userName]);

  return { roomInfo, loading, error };
}

export default useRoomId;*/