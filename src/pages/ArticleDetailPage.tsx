// pages/ArticleDetailPage.tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { getArticleDetail } from '../apis/articleApi';
import {
  type Subscription,
  getMySubscriptions,
  subscribeBoard,
  unsubscribeBoard,
} from '../apis/boardApi';
import { addBookmark, getBookmarks, removeBookmark } from '../apis/bookmarkApi';
import { useUserStore } from '../store/useUserStore';
import styles from './ArticleDetailPage.module.css';

const ArticleDetailPage = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const {
    data: article,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => getArticleDetail(Number(articleId)),
    enabled: !!articleId,
    retry: 1,
  });

  // Fetch My Subscriptions
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: getMySubscriptions,
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: subscribeBoard,
    onSuccess: (newSubscription) => {
      queryClient.setQueryData<Subscription[]>(
        ['subscriptions', user?.id],
        (oldSubs = []) => {
          return [...oldSubs, newSubscription];
        }
      );
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      alert('구독되었습니다.');
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 409) {
        alert('이미 구독 중입니다.');
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      } else {
        alert('구독에 실패했습니다.');
      }
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: unsubscribeBoard,
    onSuccess: (_, subscriptionId) => {
      queryClient.setQueryData<Subscription[]>(
        ['subscriptions', user?.id],
        (oldSubs = []) => {
          return oldSubs.filter((sub) => sub.id !== subscriptionId);
        }
      );
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      alert('구독이 취소되었습니다.');
    },
    onError: () => {
      alert('구독 취소에 실패했습니다.');
    },
  });

  // Bookmark Logic
  const { data: bookmarkedArticles = [] } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: getBookmarks,
    enabled: !!user,
  });

  const bookmarkedIds = new Set(bookmarkedArticles.map((b) => b.id));

  const addBookmarkMutation = useMutation({
    mutationFn: (id: number) => addBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
    onError: (e: AxiosError<{ message: string }>) => {
      console.error('Failed to bookmark', e);
      alert(
        `북마크 추가에 실패했습니다: ${e.response?.data?.message || e.message}`
      );
    },
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: (bookmarkId: number) => removeBookmark(bookmarkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
    onError: (e: AxiosError<{ message: string }>) => {
      console.error('Failed to remove bookmark', e);
      alert(
        `북마크 해제에 실패했습니다: ${e.response?.data?.message || e.message}`
      );
    },
  });

  const handleBookmarkToggle = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    if (bookmarkedIds.has(id)) {
      const bookmark = bookmarkedArticles.find((b) => b.id === id);
      if (bookmark && bookmark.bookmarkId) {
        if (window.confirm('북마크를 해제하시겠습니까?')) {
          removeBookmarkMutation.mutate(bookmark.bookmarkId);
        }
      } else {
        alert('북마크 정보를 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.');
      }
    } else {
      if (window.confirm('이 글을 북마크하시겠습니까?')) {
        addBookmarkMutation.mutate(id);
      }
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (isError) {
    // Check if it's a 404
    // @ts-ignore - axios error handling usually needs more type guarding, simplifying for now
    if (error?.response?.status === 404) {
      return (
        <div className={styles.notFound}>
          <h2>게시글을 찾을 수 없습니다.</h2>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            뒤로 가기
          </button>
        </div>
      );
    }
    return <div className={styles.error}>에러가 발생했습니다.</div>;
  }

  if (!article) return null;

  return (
    <div className={styles.container}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        목록으로
      </button>

      <div className={styles.articleHeader}>
        <div className={styles.boardName}>
          [{article.board.name}]
          {user &&
            (() => {
              const subscription = subscriptions.find(
                (sub) => sub.boardId === article.board.id
              );
              const isSubscribed = !!subscription;

              return (
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <button
                    className={`${styles.subscribeButton} ${
                      isSubscribed ? styles.subscribed : ''
                    }`}
                    onClick={(e) => {
                      e.preventDefault();

                      if (isSubscribed) {
                        if (window.confirm('구독을 취소하시겠습니까?')) {
                          unsubscribeMutation.mutate(subscription.id);
                        }
                      } else {
                        if (window.confirm('이 게시판을 구독하시겠습니까?')) {
                          subscribeMutation.mutate(article!.board.id);
                        }
                      }
                    }}
                  >
                    {isSubscribed ? '✔ 구독중' : '구독'}
                  </button>
                  <span
                    className={`${styles.bookmarkTag} ${
                      bookmarkedIds.has(article!.id)
                        ? styles.bookmarkActive
                        : ''
                    }`}
                    onClick={(e) => handleBookmarkToggle(e, article!.id)}
                    role="button"
                    title={
                      bookmarkedIds.has(article!.id) ? '북마크 해제' : '북마크'
                    }
                  >
                    {bookmarkedIds.has(article!.id) ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M5 5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21L12 17.5L5 21V5Z" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
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
                </div>
              );
            })()}
        </div>
        <h1 className={styles.title}>{article.title}</h1>
        <div className={styles.metaInfo}>
          <div>
            <span style={{ marginRight: '15px' }}>
              작성자: {article.author}
            </span>
            <span>{new Date(article.publishedAt).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {article.originLink && (
        <div className={styles.originLinkBox}>
          <p className={styles.originLinkText}>
            <strong>원본 링크: </strong>
            <a
              href={article.originLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {article.originLink}
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default ArticleDetailPage;
