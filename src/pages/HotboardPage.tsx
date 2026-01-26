import { getHotArticles } from '@/apis/articleApi';
import {
  getMySubscriptions,
  subscribeBoard,
  unsubscribeBoard,
} from '@/apis/boardApi';
import { addBookmark, getBookmarks, removeBookmark } from '@/apis/bookmarkApi';
import ArticleItemStats from '@/components/article/ArticleItemStats';
import { useUserStore } from '@/store/useUserStore';
import type { Article } from '@/types/article';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Link } from 'react-router-dom';
import styles from './Inbox.module.css';

const HotboardPage = () => {
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const { data: hotData, isLoading } = useQuery({
    queryKey: ['hotArticles'],
    queryFn: () => getHotArticles(),
  });

  const articles = hotData?.data || [];

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: getMySubscriptions,
    enabled: !!user,
  });

  const { data: bookmarkedArticles = [] } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: getBookmarks,
    enabled: !!user,
  });

  const bookmarkedIds = new Set(bookmarkedArticles.map((b) => b.id));

  const subscribeMutation = useMutation({
    mutationFn: (boardId: number) => subscribeBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      alert('구독되었습니다.');
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
      alert('구독이 취소되었습니다.');
    },
    onError: (error) => {
      console.error('Failed to unsubscribe', error);
      alert('구독 취소에 실패했습니다.');
    },
  });

  const addBookmarkMutation = useMutation({
    mutationFn: (id: number) => addBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error('Failed to bookmark', error);
      alert(
        `북마크 추가에 실패했습니다: ${
          error.response?.data?.message || error.message
        }`
      );
    },
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: (bookmarkId: number) => removeBookmark(bookmarkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error('Failed to remove bookmark', error);
      alert(
        `북마크 해제에 실패했습니다: ${
          error.response?.data?.message || error.message
        }`
      );
    },
  });

  const handleBookmarkToggle = (e: React.MouseEvent, article: Article) => {
    e.preventDefault();
    e.stopPropagation();

    if (bookmarkedIds.has(article.id)) {
      const bookmark = bookmarkedArticles.find((b) => b.id === article.id);
      const idToRemove = bookmark?.bookmarkId || article.bookmarkId;

      if (idToRemove) {
        if (window.confirm('북마크를 해제하시겠습니까?')) {
          removeBookmarkMutation.mutate(idToRemove);
        }
      } else {
        alert('북마크 정보를 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.');
      }
    } else {
      if (window.confirm('이 글을 북마크하시겠습니까?')) {
        addBookmarkMutation.mutate(article.id);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <h2
          className={styles.pageTitle}
          style={{ margin: 0, borderBottom: '2px solid #333' }}
        >
          HOT 게시판
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
                        display: 'flex',
                        paddingRight: '12px',
                        width: '100%',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div className={styles.itemContent}>
                        <div className={styles.headerRow}>
                          <div className={styles.itemCategory}>
                            [{article.board?.name || 'Unknown Board'}]
                          </div>
                          {user &&
                            (() => {
                              const subscription = subscriptions.find(
                                (s) => s.boardId === article.board?.id
                              );
                              const isSubscribed = !!subscription;

                              return (
                                <span
                                  className={`${styles.subscribeTag} ${
                                    isSubscribed ? styles.active : ''
                                  }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (isSubscribed) {
                                      if (
                                        window.confirm(
                                          '정말 구독을 취소하시겠습니까?'
                                        )
                                      ) {
                                        unsubscribeMutation.mutate(
                                          subscription.id
                                        );
                                      }
                                    } else if (article.board?.id) {
                                      subscribeMutation.mutate(
                                        article.board.id
                                      );
                                    }
                                  }}
                                  role="button"
                                >
                                  {isSubscribed ? '✔ 구독중' : '구독'}
                                </span>
                              );
                            })()}
                          {user && (
                            <span
                              className={`${styles.bookmarkTag} ${
                                bookmarkedIds.has(article.id)
                                  ? styles.active
                                  : ''
                              }`}
                              onClick={(e) => handleBookmarkToggle(e, article)}
                              role="button"
                              title={
                                bookmarkedIds.has(article.id)
                                  ? '북마크 해제'
                                  : '북마크'
                              }
                            >
                              {bookmarkedIds.has(article.id) ? (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M5 5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21L12 17.5L5 21V5Z" />
                                </svg>
                              ) : (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M19 21L12 17.5L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z" />
                                </svg>
                              )}
                            </span>
                          )}
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
                      </div>

                      <div className={styles.itemSide}>
                        <ArticleItemStats
                          articleId={article.id}
                          likeCount={article.likes}
                          dislikeCount={article.dislikes}
                          isLiked={!!article.isLiked}
                          isDisliked={!!article.isDisliked}
                        />
                        <div className={styles.viewCount} title="조회수">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          <span>{article.views?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                )
            )
          ) : (
            <p className={styles.emptyNotice}>
              {isLoading ? '로딩 중...' : 'HOT 게시글이 없습니다.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotboardPage;
