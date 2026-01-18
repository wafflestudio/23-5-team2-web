import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getArticles } from '../apis/articleApi';
import { getBoards, getMySubscriptions, unsubscribeBoard } from '../apis/boardApi';
import { useUserStore } from '../store/useUserStore';
import type { Article } from '../types/article';
import styles from './Inbox.module.css';

const Inbox = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [inboxMessages, setInboxMessages] = useState<Article[]>([]);
  // activeFilters removed as it conflicted with history persistence and was unused
  const [isEditing, setIsEditing] = useState(false);
  const [inactiveBoardIds, setInactiveBoardIds] = useState<Set<number>>(new Set());

  // Unsubscribe Mutation
  const unsubscribeMutation = useMutation({
    mutationFn: (subscriptionId: number) => unsubscribeBoard(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: (error) => {
      console.error('Failed to unsubscribe', error);
      alert('구독 취소에 실패했습니다.');
    }
  });

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    if (user) {
      const savedKey = `inbox_notifications_${user.id}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        try {
          setInboxMessages(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse inbox messages', e);
        }
      }
    }
  }, [user]);

  // 2. Fetch Helper Data
  const { data: boards = [] } = useQuery({
    queryKey: ['boards'],
    queryFn: getBoards,
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: getMySubscriptions,
    enabled: !!user,
  });

  const subscribedBoards = boards.filter((board) =>
    subscriptions.some((sub: any) => sub.boardId === board.id)
  );
  
  const subscribedBoardIds = subscribedBoards.map(b => b.id).join(',');

  // 3. Fetch Candidate Articles (From current subscriptions)
  const { data: articleData } = useQuery({
    queryKey: ['todaysArticles', subscribedBoardIds],
    queryFn: () => getArticles({
      boardids: subscribedBoardIds,
      limit: 50
    }),
    enabled: !!user && subscribedBoardIds.length > 0,
    refetchInterval: 30000,
  });

  // 4. Sync Logic: "Receive" new messages from today
  useEffect(() => {
    if (!articleData?.data || !user) return;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newCandidates = articleData.data.filter(article => {
      const pubDate = new Date(article.publishedAt);
      return pubDate >= oneWeekAgo;
    });

    if (newCandidates.length > 0) {
      setInboxMessages(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const trulyNew = newCandidates.filter(c => !existingIds.has(c.id));
        
        if (trulyNew.length === 0) return prev;

        const updated = [...trulyNew, ...prev].sort((a, b) => 
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

        localStorage.setItem(`inbox_notifications_${user.id}`, JSON.stringify(updated));
        return updated;
      });
    }
  }, [articleData, user]);

  const handleTagClick = (boardId: number) => {
    if (isEditing) {
      const subscription = subscriptions.find((sub: any) => sub.boardId === boardId);
      if (subscription) {
         if (window.confirm('정말 구독을 취소하시겠습니까?')) {
            unsubscribeMutation.mutate(subscription.id);
         }
      }
    } else {
      // Toggle filter
      setInactiveBoardIds(prev => {
        const next = new Set(prev);
        if (next.has(boardId)) {
          next.delete(boardId);
        } else {
          next.add(boardId);
        }
        return next;
      });
    }
  };

  const filteredMessages = inboxMessages.filter(msg => !inactiveBoardIds.has(msg.board.id));

  return (
    <div className={styles.container}>
      {/* Page Title */}
      <h2 className={styles.pageTitle}>수신함 (Inbox)</h2>

      <div className={styles.inboxWrapper}>
        
        {/* Left: Subscribed Boards Sidebar */}
        {user && (
          <aside className={styles.sidebarArea}>
            <div className={styles.subscribedSection}>
              <div className={styles.sidebarHeader}>
                <h3 className={styles.sectionTitle}>✨ 구독 게시판</h3>
                <button 
                  className={styles.editButton}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? '완료' : '편집'}
                </button>
              </div>
              
              <div className={styles.boardList}>
                {subscribedBoards.length > 0 ? (
                  subscribedBoards.map((board) => {
                    const isActive = !inactiveBoardIds.has(board.id);
                    return (
                      <div 
                        key={board.id} 
                        className={`
                          ${styles.boardTag} 
                          ${isActive ? styles.active : styles.inactive}
                          ${isEditing ? styles.editing : ''}
                        `}
                        onClick={() => handleTagClick(board.id)}
                      >
                        {board.name}
                        {isEditing && <span className={styles.deleteIcon}>✕</span>}
                        {!isEditing && <span className={styles.checkIcon}>✔</span>}
                      </div>
                    );
                  })
                ) : (
                  <span className={styles.noSubscriptions}>
                    아직 구독한 게시판이 없습니다.
                  </span>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Right: Message List */}
        <div className={styles.notificationList}>
          {filteredMessages.length > 0 ? (
            filteredMessages.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.id}`}
                className={`${styles.notificationItem} ${styles.unread}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div className={styles.itemCategory}>[{article.board.name}]</div>
                <div className={styles.itemTitle}>{article.title}</div>
                <div className={styles.itemFooter}>
                  <span className={styles.itemSender}>{article.author}</span>
                  <span className={styles.divider}>|</span>
                  <span className={styles.itemDate}>{new Date(article.publishedAt).toLocaleString()}</span>
                </div>
              </Link>
            ))
          ) : (
            <p className={styles.emptyNotice}>
              {inboxMessages.length === 0 
                ? "수신함이 비어있습니다." 
                : "선택된 게시판의 메시지가 없습니다."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
