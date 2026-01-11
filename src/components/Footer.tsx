// components/Footer.tsx
import { Link, useLocation } from 'react-router-dom'; // useLocation 추가

const Footer = () => {
  const location = useLocation(); // 현재 위치 정보를 가져옵니다.

  return (
    <footer style={S.footer}>
      <div style={S.text}>마지막 업데이트: 0일 0시간 전</div>

      {/* 현재 주소가 /health이면 '돌아가기', 아니면 'health' 링크 표시 */}
      {location.pathname === '/health' ? (
        <Link to="/" style={S.link}>
          돌아가기
        </Link>
      ) : (
        <Link to="/health" style={S.link}>
          health
        </Link>
      )}
    </footer>
  );
};

const S = {
  footer: {
    width: '100%',
    boxSizing: 'border-box' as const,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 2rem',
    height: '60px',
    borderTop: '1px solid #eaeaea',
    backgroundColor: '#f8f9fa',
    marginTop: 'auto',
  },
  text: {
    fontSize: '0.85rem',
    color: '#888',
    whiteSpace: 'nowrap' as const,
  },
  link: {
    fontSize: '0.85rem',
    color: '#aaa',
    textDecoration: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
};

export default Footer;
