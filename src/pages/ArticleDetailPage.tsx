// pages/ArticleDetailPage.tsx
import { useMutation, useQuery } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { deleteArticle, getArticleDetail } from '../apis/articleApi';
import styles from './ArticleDetailPage.module.css';

const ArticleDetailPage = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '';

  const {
    data: article,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => getArticleDetail(Number(articleId)),
    enabled: !!articleId,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      alert('게시글이 삭제되었습니다.');
      navigate(`/${from}`);
    },
    onError: (error) => {
      console.error('Delete failed', error);
      alert('게시글 삭제에 실패했습니다.');
    },
  });

  const handleDelete = () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(Number(articleId));
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${articleId}`, { state: { from } });
  };

  const handleBack = () => {
    if (from) {
      navigate(`/${from}`);
    } else {
      navigate(-1);
    }
  };

  if (isLoading) return <div className={styles.loading}>Loading...</div>;
  if (isError || !article)
    return <div className={styles.error}>게시글을 불러올 수 없습니다.</div>;

  // Sanitize HTML content
  const sanitizedContent = DOMPurify.sanitize(article.content);

  return (
    <div className={styles.container}>
      <button onClick={handleBack} className={styles.backButton}>
        목록으로
      </button>

      <div className={styles.header}>
        <div className={styles.metaRow}>
          <span className={styles.id}>#{article.id}</span>
          <span className={styles.board}>{article.board?.name}</span>
        </div>
        <h1 className={styles.title}>{article.title}</h1>
        <div className={styles.infoRow}>
          <span className={styles.author}>{article.author || '익명'}</span>
          <span className={styles.date}>
            {new Date(article.publishedAt).toLocaleDateString()}
          </span>
          <div className={styles.buttonGroup}>
            <button onClick={handleEdit} className={styles.editButton}>
              수정
            </button>
            <button onClick={handleDelete} className={styles.deleteButton}>
              삭제
            </button>
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
