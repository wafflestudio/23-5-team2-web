import { Link, useLocation } from 'react-router-dom';
import { CrawlerStatus } from './CrawlerStatus'; // 새로 만든 컴포넌트 임포트
import styles from './Footer.module.css';

const Footer = () => {
  const location = useLocation();

  return (
    <footer className={styles.footer}>
      {/* 왼쪽: 크롤러 상태 및 업데이트 정보 */}
      <CrawlerStatus />

      {/* 오른쪽: 페이지 이동 링크 */}
      <div className={styles.rightSection}>
        {location.pathname === '/health' ? (
          <Link to="/" className={styles.link}>
            돌아가기
          </Link>
        ) : (
          <Link to="/health" className={styles.link}>
            health
          </Link>
        )}
      </div>
    </footer>
  );
};

export default Footer;
