// src/components/ConnectionStatus.tsx
import React, { useEffect, useState } from 'react';
import styles from './ConnectionStatus.module.css';

interface ConnectionStatusProps {
  connected: boolean;
  errorMessage: string | null;
  showReconnect?: boolean;
  onReconnect?: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  connected, 
  errorMessage, 
  showReconnect = false,
  onReconnect 
}) => {
  const [visible, setVisible] = useState(true);

  // Ocultar el mensaje después de 10 segundos si estamos conectados
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (connected && !showReconnect) {
      timer = setTimeout(() => {
        setVisible(false);
      }, 8000);
    } else {
      setVisible(true);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [connected, showReconnect]);

  // Si no hay mensaje o no es visible, no mostrar nada
  if (!errorMessage || !visible) {
    return null;
  }

  const handleReconnectClick = () => {
    if (onReconnect) {
      onReconnect();
    }
  };

  return (
    <div className={`${styles.banner} ${connected ? styles.success : styles.error}`}>
      <div className={styles.icon}>
        {connected ? '✓' : '!'}
      </div>
      <div className={styles.message}>
        {errorMessage}
      </div>
      {showReconnect && (
        <button 
          onClick={handleReconnectClick}
          className={styles.reconnectButton}
        >
          Reconectar
        </button>
      )}
      <button 
        onClick={() => setVisible(false)} 
        className={styles.closeButton}
      >
        ×
      </button>
    </div>
  );
};

export default ConnectionStatus;