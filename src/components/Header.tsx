// components/Header.tsx
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../apis/authApi';
import { useUserStore } from '../store/useUserStore';
import styles from './Header.module.css';

const Header = () => {
  const { user, clearUser, isLoading } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      clearUser();
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
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
            <span style={S.statusText}>
              <strong>{user.localId || user.oauthId || '사용자'}</strong>
            </span>

            {/* 인박스 버튼 추가 */}
            <Link to="/inbox" style={S.textLink}>
              Inbox
            </Link>

            <Link to="/bookmark" style={S.textLink}>
              북마크
            </Link>

            {/* 마이페이지 버튼 */}
            <Link to="/mypage" style={S.textLink}>
              마이페이지
            </Link>

            <button onClick={handleLogout} style={S.textLink}>
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

// 스타일 정의 (S) 는 기존과 동일하므로 생략합니다.
const S = {
  // ... (Your existing styles remain exactly as they were)
  statusText: {
    fontSize: '14px',
    color: '#555',
    whiteSpace: 'nowrap' as const,
  },
  textLink: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    fontSize: '16px',
    color: '#333',
    textDecoration: 'none',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap' as const,
  },
};

export default Header;
