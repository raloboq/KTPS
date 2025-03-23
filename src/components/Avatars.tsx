// src/components/Avatars.tsx
/*import styles from "./Avatars.module.css";
import { useEffect, useState } from "react";

// Esta versión simplificada se actualizará cuando implementes la conexión Socket.io completa
export function Avatars() {
  return (
    <div className={styles.avatars}>
      {}
    </div>
  );
}

export function Avatar({ picture, name }: { picture: string; name: string }) {
  return (
    <div className={styles.avatar} data-tooltip={name}>
      <img
        src={picture}
        alt={`Avatar de ${name}`}
        className={styles.avatar_picture}
      />
    </div>
  );
}*/
import styles from "./Avatars.module.css";
import { useEffect, useState } from "react";

type User = {
  name: string;
  color: string;
  picture?: string;
};

type AvatarsProps = {
  provider?: any; // Podría ser nuestro SocketIOProvider
};

// Versión simplificada de Avatars que funciona con Socket.IO
export function Avatars({ provider }: AvatarsProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!provider) return;

    // Función para actualizar la lista de usuarios
    const updateUsersList = () => {
      if (provider.getStates) {
        const states = provider.getStates();
        const usersList: User[] = [];
        
        // Convertir el Map de estados a un array de usuarios
        if (states instanceof Map) {
          states.forEach((state) => {
            if (state.user) {
              usersList.push(state.user);
            }
          });
        }
        
        setUsers(usersList);
      }
    };

    // Suscribirse a eventos de awareness (usuarios que entran/salen)
    provider.on('awareness', updateUsersList);
    
    // Actualizar la lista inicial
    updateUsersList();

    // Limpiar al desmontar
    return () => {
      provider.off('awareness', updateUsersList);
    };
  }, [provider]);

  if (!provider || users.length === 0) {
    return <div className={styles.noUsers}>Sin otros usuarios conectados</div>;
  }

  return (
    <div className={styles.avatars}>
      {users.map((user, index) => (
        <Avatar 
          key={index} 
          picture={user.picture || `https://via.placeholder.com/32/24292e/fff?text=${user.name.charAt(0)}`}
          name={user.name}
        />
      ))}
    </div>
  );
}

export function Avatar({ picture, name }: { picture: string; name: string }) {
  return (
    <div className={styles.avatar} data-tooltip={name}>
      <img
        src={picture}
        alt={`Avatar de ${name}`}
        className={styles.avatar_picture}
      />
    </div>
  );
}
