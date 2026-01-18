import {
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
import { useUserStore } from '../store/useUserStore';
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
                <div className={styles.boardName}>
                  [{article.board.name}]
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
                              if (
                                window.confirm('이 게시판을 구독하시겠습니까?')
                              ) {
                                subscribeMutation.mutate(article.board.id);
                              }
                            }
                          }}
                        >
                          {isSubscribed ? '✔ 구독중' : '구독'}
                        </button>
                      );
                    })()}
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
