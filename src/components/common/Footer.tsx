import { CrawlerStatus } from './CrawlerStatus'; // 새로 만든 컴포넌트 임포트
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* 왼쪽: 크롤러 상태 및 업데이트 정보 */}
      <CrawlerStatus />
    </footer>
  );
};

export default Footer;
