'use client';

import { useRouter } from 'next/navigation';
import { logout, getMoodleFullName } from '@/utils/moodleAuth';
import styles from '@/app/admin/adminPage.module.css';

export default function LogoutButton() {
  const router = useRouter();
  const fullName = getMoodleFullName();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className={styles.userInfo}>
      {fullName && <span className={styles.userName}>Bienvenido, {fullName}</span>}
      <button onClick={handleLogout} className={styles.logoutButton}>
        Cerrar Sesión
      </button>
    </div>
  );
}