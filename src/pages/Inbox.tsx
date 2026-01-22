import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getBoards,
  getMySubscriptions,
  subscribeBoard,
  unsubscribeBoard,
} from '../apis/boardApi';
import { addBookmark, getBookmarks, removeBookmark } from '../apis/bookmarkApi';
import { deleteInbox, getInboxes, readInbox } from '../apis/inboxApi';
import { useUserStore } from '../store/useUserStore';
import type { Article, ArticleListResponse } from '../types/article';
import styles from './Inbox.module.css';

const Inbox = () => {
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  // Bookmark State & Logic
  // Fetch existing bookmarks to determine initial state 'isBookmarked' for filtered items
  // Ideally backend should return `isBookmarked` on the article object, but if not we can derive it.
  const { data: bookmarkedArticles = [] } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: getBookmarks,
    enabled: !!user,
  });

  // Fetch My Subscriptions (Moved Up)
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: getMySubscriptions,
    enabled: !!user,
  });

  // Derive a Set for quick lookup
  const bookmarkedIds = new Set(bookmarkedArticles.map((b) => b.id));

  const addBookmarkMutation = useMutation({
    mutationFn: (id: number) => {
      return addBookmark(id);
    },
    onMutate: async (newBookmarkId) => {
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
      const previousBookmarks =
        queryClient.getQueryData<Article[]>(['bookmarks']) || [];

      // Find the full article object from the inbox cache
      let articleToAdd: Article | undefined;
      const inboxData = queryClient.getQueryData<
        InfiniteData<ArticleListResponse>
      >(['inbox', user?.id]);

      if (inboxData?.pages) {
        for (const page of inboxData.pages) {
          if (!page?.data) continue;
          const found = page.data.find((msg) => msg.id === newBookmarkId);
          if (found) {
            articleToAdd = found;
            break;
          }
        }
      }

      if (articleToAdd) {
        queryClient.setQueryData(['bookmarks'], (old: Article[] = []) => [
          ...old,
          articleToAdd!,
        ]);
      } else {
        console.warn(
          'Could not find article/message in inbox cache for optimistic bookmark'
        );
      }

      return { previousBookmarks };
    },
    onError: (e: AxiosError<{ message: string }>, _, context) => {
      console.error('Failed to bookmark', e);
      alert(
        `북마크 추가에 실패했습니다: ${e.response?.data?.message || e.message}`
      );
      if (context?.previousBookmarks) {
        queryClient.setQueryData(['bookmarks'], context.previousBookmarks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: (bookmarkId: number) => {
      return removeBookmark(bookmarkId);
    },
    onMutate: async (bookmarkIdToRemove) => {
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
      const previousBookmarks =
        queryClient.getQueryData<Article[]>(['bookmarks']) || [];

      queryClient.setQueryData(['bookmarks'], (old: Article[] = []) =>
        old.filter((b) => b.bookmarkId !== bookmarkIdToRemove)
      );

      return { previousBookmarks };
    },
    onError: (e: AxiosError<{ message: string }>, _, context) => {
      console.error('Failed to remove bookmark', e);
      alert(
        `북마크 해제에 실패했습니다: ${e.response?.data?.message || e.message}`
      );
      if (context?.previousBookmarks) {
        queryClient.setQueryData(['bookmarks'], context.previousBookmarks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const handleBookmarkToggle = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarkedIds.has(id)) {
      // Find the bookmarkId corresponding to this articleId
      const bookmark = bookmarkedArticles.find((b) => b.id === id);
      if (bookmark && bookmark.bookmarkId) {
        removeBookmarkMutation.mutate(bookmark.bookmarkId);
      } else {
        alert('북마크 정보를 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.');
      }
    } else {
      addBookmarkMutation.mutate(id);
    }
  };
  const [inactiveBoardIds, setInactiveBoardIds] = useState<Set<number>>(
    new Set()
  );

  // Subscribe Mutation
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

  // 1. Fetch Inboxes (Notifications) with Pagination
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<
      ArticleListResponse,
      Error,
      InfiniteData<ArticleListResponse>,
      (string | number | undefined)[],
      { limit: number; nextPublishedAt?: number; nextId?: number }
    >({
      queryKey: ['inbox', user?.id],
      queryFn: ({ pageParam }) => getInboxes({ ...pageParam, limit: 15 }),
      initialPageParam: { limit: 15 } as {
        limit: number;
        nextPublishedAt?: number;
        nextId?: number;
      },
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

  // Use Data Directly
  const inboxMessages =
    (data?.pages?.[pageIndex]?.data || []).map((item) => ({
      ...item,
      isInbox: true,
    })) || [];

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

  // ... (Boards & Subscriptions)

  const { data: boards = [] } = useQuery({
    queryKey: ['boards'],
    queryFn: getBoards,
  });

  // Subscriptions already fetched at top

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

    const idsToDelete = Array.from(selectedIds);

    if (window.confirm(`${selectedIds.size}개의 메시지를 삭제하시겠습니까?`)) {
      try {
        await Promise.all(idsToDelete.map((id) => deleteInbox(id)));
        queryClient.invalidateQueries({ queryKey: ['inbox'] });

        setSelectedIds(new Set());
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

  const navigate = useNavigate();

  const handleRead = (
    e: React.MouseEvent,
    article: Article & { isInbox?: boolean }
  ) => {
    // Prevent default link navigation to handle logic first
    e.preventDefault();
    if (isSelectionMode) return;

    // Only mark as read if it's an Inbox item and currently unread
    if (article.isInbox && !article.isRead) {
      readMutation.mutate(article.id);
    }

    // Navigate programmatically passing the state
    navigate(`/article/${article.id}`, {
      state: {
        isInbox: article.isInbox,
      },
    });
  };

  // ...

  // Update render to show pagination controls instead of Load More

  return (
    <div className={styles.container}>
      {/* ... Header ... */}
      <div className={styles.headerArea}>
        <h2
          className={styles.pageTitle}
          style={{ margin: 0, borderBottom: '2px solid #333' }}
        >
          Inbox
        </h2>
        {/* Bulk Actions ... */}
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
                    state={{
                      isMock: (article as Article & { isMock?: boolean })
                        .isMock,
                      isInbox: article.isInbox,
                    }}
                    className={`${styles.notificationItem} ${!article.isRead ? styles.unread : ''}`}
                    style={{
                      textDecoration: 'none',
                      display: 'block',
                      paddingRight: '48px',
                    }}
                    onClick={(e) => handleRead(e, article)}
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
                        className={`${styles.bookmarkTag} ${bookmarkedIds.has(article.id) ? styles.active : ''}`}
                        onClick={(e) => handleBookmarkToggle(e, article.id)}
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
                      {/* Delete Icon (Trash) - Only for Inbox items */}
                      {article.isInbox !== false && (
                        <span
                          className={styles.deleteTag}
                          onClick={(e) =>
                            handleDelete(
                              e,
                              article.id
                            )
                          }
                          role="button"
                          title="삭제"
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
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2" />
                          </svg>
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
                  </Link>
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
              disabled={
                (!hasNextPage && pageIndex === (data?.pages.length || 0) - 1) ||
                isFetchingNextPage
              }
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
