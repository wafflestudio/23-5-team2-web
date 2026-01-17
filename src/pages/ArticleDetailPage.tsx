// pages/ArticleDetailPage.tsx
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { getArticleDetail } from '../apis/articleApi';
import styles from './ArticleDetailPage.module.css';

const ArticleDetailPage = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();

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
        <div className={styles.boardName}>[{article.board.name}]</div>
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
