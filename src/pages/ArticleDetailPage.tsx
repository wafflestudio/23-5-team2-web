// pages/ArticleDetailPage.tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { getArticleDetail } from '../apis/articleApi';
import { getMySubscriptions, subscribeBoard, unsubscribeBoard, type Subscription } from '../apis/boardApi';
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
      queryClient.setQueryData<Subscription[]>(['subscriptions', user?.id], (oldSubs = []) => {
        return [...oldSubs, newSubscription];
      });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      alert('구독되었습니다.');
    },
    onError: (error: any) => {
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
      queryClient.setQueryData<Subscription[]>(['subscriptions', user?.id], (oldSubs = []) => {
        return oldSubs.filter((sub) => sub.id !== subscriptionId);
      });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      alert('구독이 취소되었습니다.');
    },
    onError: () => {
      alert('구독 취소에 실패했습니다.');
    },
  });

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
          {user && (
            (() => {
              const subscription = subscriptions.find((sub: any) => sub.boardId === article.board.id);
              const isSubscribed = !!subscription;

              return (
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
              );
            })()
          )}
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
