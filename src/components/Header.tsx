// components/Header.tsx
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../apis/authApi';
import { useUserStore } from '../store/useUserStore';
import styles from './Header.module.css';

const Header = () => {
  const { user, clearUser, isLoading } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout();
    clearUser();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      {/* 왼쪽: 서비스 이름 */}
      <Link to="/" className={styles.logo}>
        스누보드
      </Link>

      {/* 오른쪽: 내비게이션 영역 */}
      <nav className={styles.nav}>
        {isLoading ? (
          <span className={styles.statusText}>확인 중...</span>
        ) : user ? (
          <>
            <span className={styles.statusText}>
              {/* localId가 있으면 출력, 없으면 oauthId 출력, 그것도 없으면 "사용자" 출력 */}
              <strong>{user.localId || user.oauthId || '사용자'}</strong>
            </span>
            <button onClick={handleLogout} className={styles.textLink}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.textLink}>
              로그인
            </Link>
            <Link to="/register" className={styles.textLink}>
              회원가입
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
