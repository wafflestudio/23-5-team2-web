import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
// pages/HomePage.tsx
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { getArticles } from '../apis/articleApi';
import {
  type Subscription,
  getBoards,
  getMySubscriptions,
  subscribeBoard,
  unsubscribeBoard,
} from '../apis/boardApi';
import { addBookmark, getBookmarks, removeBookmark } from '../apis/bookmarkApi';
import { useUserStore } from '../store/useUserStore';
import type { Article, ArticleListResponse } from '../types/article';
import styles from './HomePage.module.css';

const HomePage = () => {
  const [keyword, setKeyword] = useState('');
  const [selectedBoardIds, setSelectedBoardIds] = useState<number[]>([]);
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  // Infinite scroll intersection observer
  const { ref, inView } = useInView();

  // 1. Fetch Boards
  const { data: boards = [] } = useQuery({
    queryKey: ['boards'],
    queryFn: getBoards,
  });

  // Track if we have initialized the selection
  const hasInitialized = React.useRef(false);

  // Effect to select all boards by default ONLY when boards first load
  useEffect(() => {
    if (boards.length > 0 && !hasInitialized.current) {
      setSelectedBoardIds(boards.map((b) => b.id));
      hasInitialized.current = true;
    }
  }, [boards]);

  // Handle Select All
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedBoardIds(boards.map((b) => b.id));
    } else {
      setSelectedBoardIds([]);
    }
  };

  const handleBoardCheck = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedBoardIds((prev) => [...prev, id]);
    } else {
      setSelectedBoardIds((prev) => prev.filter((bid) => bid !== id));
    }
  };

  const isAllSelected =
    boards.length > 0 && selectedBoardIds.length === boards.length;

  // 2. Fetch Articles (Infinite)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['articles', keyword, selectedBoardIds],
    queryFn: ({ pageParam }) =>
      getArticles({
        keyword,
        boardids:
          selectedBoardIds.length > 0 ? selectedBoardIds.join(',') : undefined,
        limit: 20,
        nextPublishedAt: pageParam?.nextPublishedAt,
        nextId: pageParam?.nextId,
      }),
    initialPageParam: undefined as
      | { nextPublishedAt?: number; nextId?: number }
      | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.paging.hasNext) {
        return {
          nextPublishedAt: lastPage.paging.nextPublishedAt,
          nextId: lastPage.paging.nextId,
        };
      }
      return undefined;
    },
    enabled: selectedBoardIds.length > 0,
  });

  // 3. Fetch My Subscriptions
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: getMySubscriptions,
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: subscribeBoard,
    onSuccess: (newSubscription) => {
      // Update cache with the new subscription object returned from server
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
      // Remove from cache
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

  // 4. Bookmark Logic
  const { data: bookmarkedArticles = [] } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: getBookmarks,
    enabled: !!user,
  });

  const bookmarkedIds = new Set(bookmarkedArticles.map((b) => b.id));

  const addBookmarkMutation = useMutation({
    mutationFn: (id: number) => {
      return addBookmark(id);
    },
    onMutate: async (newBookmarkId) => {
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
      const previousBookmarks =
        queryClient.getQueryData<Article[]>(['bookmarks']) || [];

      // Find the full article object from the feed cache to avoid ghost articles
      let articleToAdd: Article | undefined;
      const feedData = queryClient.getQueryData<
        InfiniteData<ArticleListResponse>
      >(['articles', keyword, selectedBoardIds]);

      if (feedData?.pages) {
        for (const page of feedData.pages) {
          const found = page.data.find((a) => a.id === newBookmarkId);
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
        // Fallback: If we can't find it (rare), still better to not show a broken one or maybe fetch it?
        // for now, we won't optimistically update if we can't find the data, to avoid the 'white box' issue.
        console.warn(
          'Could not find article details for optimistic bookmark update'
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
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
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
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });

  const handleBookmarkToggle = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarkedIds.has(id)) {
      // Find the bookmarkId corresponding to this articleId
      const bookmark = bookmarkedArticles.find((b) => b.id === id);
      if (bookmark && bookmark.bookmarkId) {
        if (window.confirm('북마크를 해제하시겠습니까?')) {
          removeBookmarkMutation.mutate(bookmark.bookmarkId);
        }
      } else {
        // Fallback or optimistic weirdness (e.g. just added).
        // If we don't have bookmarkId, we assume it's not fully synced or logic is tricky.
        // For now, alert failure or try to refresh.
        console.error('Bookmark ID not found for article', id);
        alert('북마크 정보를 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.');
      }
    } else {
      if (window.confirm('이 글을 북마크하시겠습니까?')) {
        addBookmarkMutation.mutate(id);
      }
    }
  };

  // Infinite scroll trigger
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div className={styles.container}>
      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="검색어를 입력하세요 (제목, 내용)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Board Filters */}
      <div className={styles.filterContainer}>
        <h3 className={styles.filterTitle}>게시판 선택</h3>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
            />
            전체 선택
          </label>
          {boards.map((board) => (
            <label key={board.id} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedBoardIds.includes(board.id)}
                onChange={(e) => handleBoardCheck(board.id, e.target.checked)}
              />
              {board.name}
            </label>
          ))}
        </div>
      </div>

      {/* Article List */}
      <div className={styles.articleList}>
        {isLoading && <p className={styles.loading}>로딩 중...</p>}
        {isError && <p className={styles.error}>에러가 발생했습니다.</p>}
        {data?.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.data.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.id}`}
                className={styles.articleItem}
              >
                <div className={styles.headerRow}>
                  <div className={styles.boardName}>[{article.board.name}]</div>
                  {user &&
                    /**
                     * Find the subscription object for this board.
                     */
                    (() => {
                      const subscription = subscriptions.find(
                        (sub) => sub.boardId === article.board.id
                      );
                      const isSubscribed = !!subscription;

                      return (
                        <span
                          className={`${styles.subscribeTag} ${
                            isSubscribed ? styles.active : ''
                          }`}
                          onClick={(e) => {
                            e.preventDefault(); // Prevent Link navigation
                            e.stopPropagation();

                            if (isSubscribed) {
                              if (window.confirm('구독을 취소하시겠습니까?')) {
                                unsubscribeMutation.mutate(subscription.id);
                              }
                            } else {
                              if (
                                window.confirm('이 게시판을 구독하시겠습니까?')
                              ) {
                                subscribeMutation.mutate(article.board.id);
                              }
                            }
                          }}
                          role="button"
                        >
                          {isSubscribed ? '✔ 구독중' : '구독'}
                        </span>
                      );
                    })()}
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
                </div>
                <div className={styles.articleTitle}>{article.title}</div>
                <div className={styles.articleMeta}>
                  <span>{article.author}</span>
                  <span className={styles.separator}>|</span>
                  <span>{new Date(article.publishedAt).toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </React.Fragment>
        ))}

        {/* Loading Indicator for Infinite Scroll */}
        <div
          ref={ref}
          className={styles.loading}
          style={{ height: '20px', padding: 0 }}
        >
          {isFetchingNextPage && '더 불러오는 중...'}
        </div>

        {!hasNextPage && data && (
          <p className={styles.endMessage}>모든 게시글을 불러왔습니다.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
