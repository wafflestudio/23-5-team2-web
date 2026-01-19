import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getBoards,
  getMySubscriptions,
  unsubscribeBoard,
} from '../apis/boardApi';
import { deleteInbox, getInboxes, readInbox } from '../apis/inboxApi';
import { useUserStore } from '../store/useUserStore';

import styles from './Inbox.module.css';

const Inbox = () => {
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [inactiveBoardIds, setInactiveBoardIds] = useState<Set<number>>(
    new Set()
  );

  // Unsubscribe Mutation
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

  // 1. Fetch Inboxes with Pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['inbox', user?.id],
    queryFn: ({ pageParam }) => getInboxes({ ...pageParam, limit: 15 }),
    initialPageParam: { limit: 15 },
    getNextPageParam: (lastPage) => {
      if (!lastPage.paging.hasNext) return undefined;
      return {
        nextPublishedAt: lastPage.paging.nextPublishedAt,
        nextId: lastPage.paging.nextId,
        limit: 15,
      };
    },
    enabled: !!user,
  });

  // Pagination State
  const [pageIndex, setPageIndex] = useState(0);

  const currentPageData = data?.pages[pageIndex]?.data || [];
  
  const handleNextPage = () => {
    if (pageIndex < (data?.pages.length || 0) - 1) {
      setPageIndex(pageIndex + 1);
    } else if (hasNextPage) {
      fetchNextPage().then(() => setPageIndex(pageIndex + 1));
    }
  };

  const handlePrevPage = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };

  const inboxMessages = currentPageData;

  // ... (Boards & Subscriptions)
  // ... (Boards & Subscriptions)
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
    subscriptions.some((sub) => sub.boardId === board.id)
  );

  const handleTagClick = (boardId: number) => {
    if (isEditing) {
      const subscription = subscriptions.find((sub) => sub.boardId === boardId);
      if (subscription) {
        if (window.confirm('정말 구독을 취소하시겠습니까?')) {
          unsubscribeMutation.mutate(subscription.id);
        }
      }
    } else {
      // Toggle filter
      setInactiveBoardIds((prev) => {
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

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteInbox(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
    onError: (error) => {
      console.error('Failed to delete message', error);
      alert('메시지 삭제에 실패했습니다.');
    },
  });

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    if (window.confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  // Bulk Delete & Selection Mode
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const filteredMessages = inboxMessages.filter(
    (msg) => msg && msg.board && !inactiveBoardIds.has(msg.board.id)
  );

  const toggleSelectionMode = () => {
    setIsSelectionMode((prev) => !prev);
    setSelectedIds(new Set()); // Clear selection when toggling
  };

  const handleSelect = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredMessages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMessages.map((msg) => msg.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`${selectedIds.size}개의 메시지를 삭제하시겠습니까?`)) {
      try {
        await Promise.all(Array.from(selectedIds).map((id) => deleteInbox(id)));
        queryClient.invalidateQueries({ queryKey: ['inbox'] });
        setSelectedIds(new Set());
        // Optional: Exit selection mode after delete? User might want to delete more. Keeping it for now.
        setIsSelectionMode(false);
        alert('삭제되었습니다.');
      } catch (e) {
        console.error('Bulk delete failed', e);
        alert('일부 메시지 삭제에 실패했습니다.');
        queryClient.invalidateQueries({ queryKey: ['inbox'] });
      }
    }
  };

  // Read Mutation
  const readMutation = useMutation({
    mutationFn: (id: number) => readInbox(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
    onError: (error) => {
      console.error('Failed to mark as read', error);
    },
  });

  const handleRead = (id: number) => {
    if (isSelectionMode) return; // Prevent reading in selection mode if clicked (though wrapper handles it)
    readMutation.mutate(id);
  };

  // ...

  // Update render to show pagination controls instead of Load More
  return (
    <div className={styles.container}>
      {/* ... Header ... */}
      <div className={styles.headerArea}>
        <h2 className={styles.pageTitle}>수신함 (Inbox)</h2>
        {/* Bulk Actions rendered conditionally on filteredMessages > 0 OR if we want to support selection on empty? No, filtered > 0 usually */}
        {filteredMessages.length > 0 && (
          <div className={styles.bulkActions}>
             {/* ... existing bulk actions ... */}
             {!isSelectionMode ? (
              <button
                className={styles.selectModeBtn}
                onClick={toggleSelectionMode}
              >
                선택
              </button>
            ) : (
                // ... selection controls ...
                <div className={styles.selectionControls}>
                <div
                  className={styles.selectAllContainer}
                  onClick={handleSelectAll}
                >
                  <label className={styles.selectAllLabel}>
                    <input
                      type="checkbox"
                      checked={
                        filteredMessages.length > 0 &&
                        selectedIds.size === filteredMessages.length
                      }
                      readOnly
                    />
                    전체 선택
                  </label>
                </div>

                <div className={styles.actionButtons}>
                  {selectedIds.size > 0 && (
                    <button
                      className={styles.bulkDeleteBtn}
                      onClick={handleBulkDelete}
                    >
                      삭제 ({selectedIds.size})
                    </button>
                  )}
                  <button
                    className={styles.cancelSelectionBtn}
                    onClick={toggleSelectionMode}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.inboxWrapper}>
        {/* Sidebar ... */}
        {user && (
          <aside className={styles.sidebarArea}>
             {/* ... */}
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
                        {isEditing && (
                          <span className={styles.deleteIcon}>✕</span>
                        )}
                        {!isEditing && (
                          <span className={styles.checkIcon}>✔</span>
                        )}
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
            <>
              {filteredMessages.map((article) => (
                <div
                  key={article.id}
                  className={styles.itemWrapper}
                  style={{ position: 'relative' }}
                >
                  {isSelectionMode && (
                     <div
                      className={styles.checkboxArea}
                      onClick={(e) => handleSelect(e, article.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(article.id)}
                        readOnly
                        style={{ pointerEvents: 'none' }} 
                      />
                    </div>
                  )}
                  <Link
                    to={`/article/${article.id}`}
                    className={`${styles.notificationItem} ${!article.isRead ? styles.unread : ''}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                    onClick={() => handleRead(article.id)}
                  >
                    <div className={styles.itemCategory}>
                      [{article.board?.name || 'Unknown Board'}]
                    </div>
                    <div className={styles.itemTitle}>{article.title}</div>
                    <div className={styles.itemFooter}>
                      <span className={styles.itemSender}>{article.author}</span>
                      <span className={styles.divider}>|</span>
                      <span className={styles.itemDate}>
                        {new Date(article.publishedAt).toLocaleString()}
                      </span>
                    </div>
                  </Link>
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => handleDelete(e, article.id)}
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </>
          ) : (
            <p className={styles.emptyNotice}>
              {inboxMessages.length === 0
                ? '수신함이 비어있습니다.'
                : '선택된 게시판의 메시지가 없습니다.'}
            </p>
          )}
          
          {/* Pagination Controls */}
          {/* Show even if empty list if user requested "show 1 when no messages" */}
          <div className={styles.pagination}>
            <button 
              className={styles.pageBtn} 
              onClick={handlePrevPage}
              disabled={pageIndex === 0}
            >
              &lt; Prev
            </button>
            <span className={styles.pageNumber}>Page {pageIndex + 1}</span>
            <button 
              className={styles.pageBtn} 
              onClick={handleNextPage}
              disabled={(!hasNextPage && pageIndex === (data?.pages.length || 0) - 1) || isFetchingNextPage}
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
