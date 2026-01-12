import { Link, useLocation } from 'react-router-dom';
import { CrawlerStatus } from './CrawlerStatus'; // 새로 만든 컴포넌트 임포트

const Footer = () => {
  const location = useLocation();

  return (
    <footer style={S.footer}>
      {/* 왼쪽: 크롤러 상태 및 업데이트 정보 */}
      <CrawlerStatus />

      {/* 오른쪽: 페이지 이동 링크 */}
      <div style={S.rightSection}>
        {location.pathname === '/health' ? (
          <Link to="/" style={S.link}>
            돌아가기
          </Link>
        ) : (
          <Link to="/health" style={S.link}>
            health
          </Link>
        )}
      </div>
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
  rightSection: {
    display: 'flex',
    alignItems: 'center',
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
