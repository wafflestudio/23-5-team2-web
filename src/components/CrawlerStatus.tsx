import { useQuery } from '@tanstack/react-query';
import { getCrawlerStatus } from '../apis/crawlerApi';
import type {
  CrawlerStatusItem,
  CrawlerStatusResponse,
} from '../types/crawler';

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

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours > 0) return `${diffHours}시간 ${diffMinutes % 60}분 전`;
    return `${diffMinutes}분 전`;
  };

  if (isLoading) return <div style={S.infoText}>크롤러 정보 로딩 중...</div>;
  if (isError || !data) return <div style={S.infoText}>상태 조회 실패</div>;

  return (
    <div style={S.container}>
      {data.results.map((crawler: CrawlerStatusItem) => (
        <div key={crawler.id} style={S.crawlerItem}>
          <span style={S.dot} />
          <span style={S.boardName}>{crawler.boardName}</span>
          <span style={S.timeText}>{getTimeDiff(crawler.lastUpdatedAt)}</span>
        </div>
      ))}
    </div>
  );
};

const S = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    overflowX: 'auto', // 크롤러가 많아질 경우 대비해 가로 스크롤 허용
    paddingRight: '1rem',
    msOverflowStyle: 'none' as const, // 스크롤바 숨기기 (IE)
    scrollbarWidth: 'none' as const, // 스크롤바 숨기기 (Firefox)
  },
  crawlerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    whiteSpace: 'nowrap' as const,
    backgroundColor: '#fff',
    padding: '2px 8px',
    borderRadius: '12px',
    border: '1px solid #eee',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#2ecc71',
  },
  boardName: {
    fontSize: '0.75rem',
    fontWeight: '600' as const,
    color: '#444',
  },
  timeText: {
    fontSize: '0.7rem',
    color: '#999',
  },
  infoText: {
    fontSize: '0.8rem',
    color: '#888',
  },
} as const;
