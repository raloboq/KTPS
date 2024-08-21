/*import { useState, useEffect } from 'react';
import { getRooms } from '@/lib/getRooms';

function useRooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const fetchedRooms = await getRooms();
                console.log("Fetched rooms:", fetchedRooms);
                setRooms(fetchedRooms);
            } catch (err) {
                console.error("Error fetching rooms:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    return { rooms, loading, error };
}

export default useRooms;*/
import { useState, useEffect } from 'react';
import { getRooms } from '@/lib/getRooms';

interface Room {
  id: string;
  name: string;
}

type ErrorType = Error | string | null;

interface UseRoomsReturn {
  rooms: Room[];
  loading: boolean;
  error: ErrorType;
}

function useRooms(): UseRoomsReturn {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<ErrorType>(null);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const fetchedRooms = await getRooms();
                console.log("Fetched rooms:", fetchedRooms);
                setRooms(fetchedRooms);
            } catch (err) {
                console.error("Error fetching rooms:", err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    return { rooms, loading, error };
}

export default useRooms;