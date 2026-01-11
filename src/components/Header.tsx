// components/Header.tsx
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../apis/auth';
import { useUserStore } from '../store/useUserStore';

const Header = () => {
  const { user, clearUser, isLoading } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout();
    clearUser();
    navigate('/');
  };

  return (
    <header style={S.header}>
      {/* 왼쪽: 서비스 이름 */}
      <Link to="/" style={S.logo}>
        스누보드
      </Link>

      {/* 오른쪽: 내비게이션 영역 */}
      <nav style={S.nav}>
        {isLoading ? (
          <span style={S.statusText}>확인 중...</span>
        ) : user ? (
          <>
            <span style={S.statusText}>
              {/* localId가 있으면 출력, 없으면 oauthId 출력, 그것도 없으면 "사용자" 출력 */}
              <strong>{user.localId || user.oauthId || '사용자'}</strong>
            </span>
            <button onClick={handleLogout} style={S.textLink}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={S.textLink}>
              로그인
            </Link>
            <Link to="/register" style={S.textLink}>
              회원가입
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

// 2. 스타일 정의 (JSX를 깨끗하게 유지)
const S = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 5%',
    backgroundColor: '#fff',
    borderBottom: '1px solid #ddd',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    textDecoration: 'none',
    color: '#000',
    flexShrink: 0,
  },
  nav: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexShrink: 0,
  },
  statusText: {
    fontSize: '14px',
    color: '#555',
    whiteSpace: 'nowrap' as const,
  },
  textLink: {
    // 버튼 기본 스타일 초기화
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    // 텍스트 스타일 (Link와 통일)
    fontSize: '16px',
    color: '#333',
    textDecoration: 'none',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap' as const,
  },
};

export default Header;
