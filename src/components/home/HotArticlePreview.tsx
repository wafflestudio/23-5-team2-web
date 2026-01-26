import { getHotArticles } from '@/apis/articleApi';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import styles from './HotArticlePreview.module.css';

const HotArticlePreview = () => {
  const { data } = useQuery({
    queryKey: ['hotArticles', 'preview'],
    queryFn: () => getHotArticles({ limit: 6 }),
  });

  const articles = data?.data || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>HOT 게시물</h3>
        <Link to="/hotboard" className={styles.moreLink}>
          more...
        </Link>
      </div>
      <ul className={styles.list}>
        {articles.length > 0 ? (
          articles.map((article) => (
            <li key={article.id} className={styles.item}>
              <Link to={`/article/${article.id}`} className={styles.link}>
                <span className={styles.articleTitle}>{article.title}</span>
                <span className={styles.date}>
                  {formatDate(article.publishedAt)}
                </span>
              </Link>
            </li>
          ))
        ) : (
          <li className={styles.emptyItem}>게시물이 없습니다.</li>
        )}
      </ul>
    </div>
  );
};

export default HotArticlePreview;
