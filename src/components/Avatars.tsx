/*import { useOthers, useSelf } from "@/liveblocks.config";
import styles from "./Avatars.module.css";

export function Avatars() {
  const users = useOthers();
  const currentUser = useSelf();

  return (
    <div className={styles.avatars}>
      {users.map(({ connectionId, info }) => {
        return (
          <Avatar key={connectionId} picture={info.picture} name={info.name} />
        );
      })}

      {currentUser && (
        <div className="relative ml-8 first:ml-0">
          <Avatar
            picture={currentUser.info.picture}
            name={currentUser.info.name}
          />
        </div>
      )}
    </div>
  );
}

export function Avatar({ picture, name }: { picture: string; name: string }) {
  return (
    <div className={styles.avatar} data-tooltip={name}>
      <img
        src={picture}
        className={styles.avatar_picture}
        data-tooltip={name}
      />
    </div>
  );
}*/
// src/components/Avatars.tsx
import styles from "./Avatars.module.css";
import { useEffect, useState } from "react";

// Esta versión simplificada se actualizará cuando implementes la conexión Socket.io completa
export function Avatars() {
  return (
    <div className={styles.avatars}>
      {/* Se llenarán dinámicamente con los usuarios conectados */}
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
