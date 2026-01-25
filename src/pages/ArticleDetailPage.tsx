// pages/ArticleDetailPage.tsx

import { deleteArticle, getArticleDetail } from '@/apis/articleApi';
import {
  type Subscription,
  getMySubscriptions,
  subscribeBoard,
  unsubscribeBoard,
} from '@/apis/boardApi';
import { addBookmark, getBookmarks, removeBookmark } from '@/apis/bookmarkApi';
import { deleteInbox } from '@/apis/inboxApi';
import ArticleItemStats from '@/components/article/ArticleItemStats';
import { useUserStore } from '@/store/useUserStore';
import type { Article } from '@/types/article';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import DOMPurify from 'dompurify';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styles from './ArticleDetailPage.module.css';
import NotFoundPage from './NotFoundPage';

const ArticleDetailPage = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '';
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const { isMock, isInbox } =
    (location.state as {
      isMock?: boolean;
      isInbox?: boolean;
    }) || {};

  const {
    data: article,
    isLoading,
    isError,
    error,
  } = useQuery<Article, AxiosError>({
    queryKey: ['article', articleId],
    queryFn: () => getArticleDetail(Number(articleId)),
    enabled: !!articleId,
  });

  // Fetch My Subscriptions
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: getMySubscriptions,
    enabled: !!user,
  });

  // ... (subscribeMutation, unsubscribeMutation, bookmark logic omitted for brevity, keeping existing)

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

  const inboxDeleteMutation = useMutation({
    mutationFn: (id: number) => deleteInbox(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
      alert('삭제되었습니다.');
      navigate(-1);
    },
    onError: (error) => {
      console.error('Failed to delete message', error);
      alert('메시지 삭제에 실패했습니다.');
    },
  });

  const articleDeleteMutation = useMutation({
    mutationFn: (id: number) => deleteArticle(id),
    onSuccess: () => {
      alert('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['articles'] }); // 목록 새로고침
      handleBack(); // 이전 화면으로 이동
    },
    onError: (error) => {
      console.error('Delete failed', error);
      alert('게시글 삭제에 실패했습니다.');
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

  const handleBookmarkDelete = () => {
    if (!article) return;

    if (window.confirm('북마크를 삭제하시겠습니까?')) {
      if (isMock) {
        // Mock Delete Logic
        try {
          const saved = sessionStorage.getItem('inbox_mock_deleted');
          const mockDeletedIds = saved ? new Set(JSON.parse(saved)) : new Set();
          mockDeletedIds.add(article.id);
          sessionStorage.setItem(
            'inbox_mock_deleted',
            JSON.stringify(Array.from(mockDeletedIds))
          );
          alert('삭제되었습니다. (Design Review Mode)');
          navigate(-1);
        } catch (e) {
          console.error('Mock delete failed', e);
          alert('가상 삭제 중 오류가 발생했습니다.');
        }
      } else {
        // Real Delete Logic
        inboxDeleteMutation.mutate(article.id);
      }
    }
  };

  const handleArticleEdit = () => {
    navigate(`/edit/${articleId}`, { state: { from } });
  };

  const handleArticleDelete = () => {
    if (window.confirm('게시글을 삭제하시겠습니까?')) {
      articleDeleteMutation.mutate(Number(articleId));
    }
  };

  const handleBack = () => {
    if (from) {
      const destination = from.startsWith('/') ? from : `/${from}`;
      navigate(destination);
    } else {
      navigate(-1);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }
  if (isError || !article) {
    if ((error as AxiosError)?.response?.status === 404) {
      return <NotFoundPage />;
    }
    // 404가 아니더라도 article이 없으면 더 이상 렌더링을 진행할 수 없으므로 에러 페이지나 null 반환
    return <div className={styles.error}>게시글을 불러올 수 없습니다.</div>;
  }

  // Sanitize HTML content
  const sanitizedContent = DOMPurify.sanitize(article.content);

  return (
    <div className={styles.container}>
      <button onClick={handleBack} className={styles.backButton}>
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
                          subscribeMutation.mutate(article.board.id);
                        }
                      }
                    }}
                  >
                    {isSubscribed ? '✔ 구독중' : '구독'}
                  </button>
                  <span
                    className={`${styles.bookmarkTag} ${
                      bookmarkedIds.has(article.id) ? styles.bookmarkActive : ''
                    }`}
                    onClick={(e) => handleBookmarkToggle(e, article.id)}
                    role="button"
                    title={
                      bookmarkedIds.has(article.id) ? '북마크 해제' : '북마크'
                    }
                  >
                    {bookmarkedIds.has(article.id) ? (
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
                  {/* Delete Icon (Trash) - Only show if it is an inbox item (real or mock) */}
                  {(isInbox || isMock) && (
                    <span
                      className={styles.bookmarkTag} // Reuse bookmark tag styles for consistency
                      onClick={handleBookmarkDelete}
                      role="button"
                      title="삭제"
                      style={{ color: '#ccc' }} // Default color, hover handled by class or inline if needed
                    >
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
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </span>
                  )}
                </div>
              );
            })()}
        </div>
        <h1 className={styles.title}>{article.title}</h1>
        <div className={styles.infoRow}>
          <span className={styles.author}>{article.author || '익명'}</span>
          <span className={styles.date}>
            {new Date(article.publishedAt).toLocaleDateString()}
          </span>
          {article.originLink && (
            <a
              href={article.originLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.originLinkHeader}
            >
              {article.originLink}
            </a>
          )}
          <span className={styles.separation} style={{ flex: 1 }}></span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ArticleItemStats
              articleId={article.id}
              likeCount={article.likes || 0}
              dislikeCount={article.dislikes || 0}
              isLiked={!!article.isLiked}
              isDisliked={!!article.isDisliked}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.9rem',
                color: '#888',
              }}
              title="조회수"
            >
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

            {user && (
              <div className={styles.buttonGroup} style={{ marginLeft: '6px' }}>
                <button
                  onClick={handleArticleEdit}
                  className={styles.editButton}
                >
                  수정
                </button>
                <button
                  onClick={handleArticleDelete}
                  className={styles.deleteButton}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render Sanitized HTML */}
      <div
        className={styles.articleBody}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </div>
  );
};

export default ArticleDetailPage;
