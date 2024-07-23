import { useState, useEffect } from 'react';
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

export default useRooms;