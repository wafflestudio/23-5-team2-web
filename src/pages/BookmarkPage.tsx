import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Link } from 'react-router-dom';
import {
  getMySubscriptions,
  subscribeBoard,
  unsubscribeBoard,
} from '../apis/boardApi';
import { getBookmarks, removeBookmark } from '../apis/bookmarkApi';
import { useUserStore } from '../store/useUserStore';
import styles from './Inbox.module.css';

const BookmarkPage = () => {
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: getBookmarks,
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: getMySubscriptions,
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: (boardId: number) => subscribeBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: (error) => {
      console.error('Failed to subscribe', error);
      alert('구독에 실패했습니다.');
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: (subscriptionId: number) => unsubscribeBoard(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: (error) => {
      console.error('Failed to unsubscribe', error);
      alert('구독 취소에 실패했습니다.');
    },
  });

  const unbookmarkMutation = useMutation({
    mutationFn: (bookmarkId: number) => removeBookmark(bookmarkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['article'] }); // Invalidate article if needed
      // Also invalidate inbox to update star status there
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error('Failed to remove bookmark', error);
      alert(
        `북마크 해제에 실패했습니다: ${error.response?.data?.message || error.message}`
      );
    },
  });

  const handleUnbookmark = (e: React.MouseEvent, bookmarkId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('북마크를 해제하시겠습니까?')) {
      unbookmarkMutation.mutate(bookmarkId);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <h2
          className={styles.pageTitle}
          style={{ margin: 0, borderBottom: '2px solid #333' }}
        >
          북마크
        </h2>
      </div>

      <div className={styles.inboxWrapper}>
        <div className={styles.notificationList}>
          {articles.length > 0 ? (
            articles.map(
              (article) =>
                article && (
                  <div
                    key={article.id}
                    className={styles.itemWrapper}
                    style={{ position: 'relative' }}
                  >
                    <Link
                      to={`/article/${article.id}`}
                      className={styles.notificationItem}
                      style={{
                        textDecoration: 'none',
                        display: 'block',
                        paddingRight: '48px',
                      }}
                    >
                      <div className={styles.headerRow}>
                        <div className={styles.itemCategory}>
                          [{article.board?.name || 'Unknown Board'}]
                        </div>
                        <span
                          className={`${styles.subscribeTag} ${subscriptions.some((s) => s.boardId === article.board?.id) ? styles.active : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const sub = subscriptions.find(
                              (s) => s.boardId === article.board?.id
                            );
                            if (sub) {
                              if (
                                window.confirm('정말 구독을 취소하시겠습니까?')
                              ) {
                                unsubscribeMutation.mutate(sub.id);
                              }
                            } else if (article.board?.id) {
                              subscribeMutation.mutate(article.board.id);
                            }
                          }}
                          role="button"
                        >
                          {subscriptions.some(
                            (s) => s.boardId === article.board?.id
                          )
                            ? '✓ 구독중'
                            : '구독'}
                        </span>
                        <span
                          className={`${styles.bookmarkTag} ${styles.active}`}
                          onClick={(e) =>
                            handleUnbookmark(e, article.bookmarkId!)
                          }
                          role="button"
                          title="북마크 해제"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M5 5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21L12 17.5L5 21V5Z" />
                          </svg>
                        </span>
                      </div>
                      <div className={styles.itemTitle}>{article.title}</div>
                      <div className={styles.itemFooter}>
                        <span className={styles.itemSender}>
                          {article.author}
                        </span>
                        <span className={styles.divider}>|</span>
                        <span className={styles.itemDate}>
                          {new Date(article.publishedAt).toLocaleString()}
                        </span>
                      </div>
                    </Link>
                  </div>
                )
            )
          ) : (
            <p className={styles.emptyNotice}>
              {isLoading ? '로딩 중...' : '북마크된 메시지가 없습니다.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarkPage;
