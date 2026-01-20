import { useQuery } from '@tanstack/react-query';
import { getCrawlerStatus } from '../apis/crawlerApi';
import type {
  CrawlerStatusItem,
  CrawlerStatusResponse,
} from '../types/crawler';
import styles from './CrawlerStatus.module.css';

export const CrawlerStatus = () => {
  const { data, isLoading, isError } = useQuery<CrawlerStatusResponse>({
    queryKey: ['crawlerStatus'],
    queryFn: getCrawlerStatus,
    // refetchInterval: 60000, // 1분마다 업데이트
  });

  // 시간 차이 계산 함수
  const getTimeDiff = (dateStr: string) => {
    const now = new Date();
    const updated = new Date(dateStr);
    const diffMs = now.getTime() - updated.getTime();

    // 음수 차이 방지 (미래 시간인 경우 0분 전 등으로 처리하거나, 혹은 방어 로직)
    const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}일 전`;
    }
    if (diffHours > 0) {
      return `${diffHours}시간 전`;
    }
    return `${diffMinutes}분 전`;
  };

  if (isLoading)
    return <div className={styles.infoText}>크롤러 정보 로딩 중...</div>;
  if (isError || !data)
    return <div className={styles.infoText}>상태 조회 실패</div>;

  return (
    <div className={styles.container}>
      {data?.results?.map((crawler: CrawlerStatusItem) => (
        <div key={crawler.id} className={styles.crawlerItem}>
          <span className={styles.dot} />
          <span className={styles.boardName}>{crawler.boardName}</span>
          <span className={styles.timeText}>
            {getTimeDiff(crawler.lastUpdatedAt)}
          </span>
        </div>
      ))}
    </div>
  );
};
