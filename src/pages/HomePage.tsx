import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from 'nuqs';
import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Link, useLocation } from 'react-router-dom';
import { getArticles } from '../apis/articleApi';
import { getBoards } from '../apis/boardApi';
import styles from './HomePage.module.css';

const HomePage = () => {
  const location = useLocation();
  // 1. Fetch Boards
  const { data: boards = [] } = useQuery({
    queryKey: ['boards'],
    queryFn: getBoards,
  });

  const ALL_BOARD_IDS = boards.map((b) => b.id).sort((a, b) => a - b);

  // 2. State Management with nuqs
  const [keyword, setKeyword] = useQueryState(
    'keyword',
    parseAsString.withDefault('').withOptions({
      clearOnDefault: true,
      shallow: true,
    })
  );

  const [selectedBoardIds, setSelectedBoardIds] = useQueryState(
    'boardIds',
    parseAsArrayOf(parseAsInteger)
      .withDefault(ALL_BOARD_IDS)
      .withOptions({
        clearOnDefault: true,
        shallow: true,
        history: 'push', // Optional: user requirement just mentioned clean URL
      })
    // User asked for: .withOptions({ clearOnDefault: true, shallow: true })
  );

  // Derived variables
  const isAllSelected =
    boards.length > 0 && selectedBoardIds.length === boards.length;
  const isNoneSelected = selectedBoardIds.length === 0;
  void isNoneSelected; // Silence unused variable warning

  // Infinite scroll intersection observer
  const { ref, inView } = useInView();

  // Handle Select All
  const handleAllToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedBoardIds(ALL_BOARD_IDS);
    } else {
      setSelectedBoardIds([]);
    }
  };

  const handleBoardCheck = (id: number, checked: boolean) => {
    setSelectedBoardIds((prev) => {
      if (checked) {
        return [...prev, id].sort((a, b) => a - b);
      }
      return prev.filter((bid) => bid !== id).sort((a, b) => a - b);
    });
  };

  // 3. Fetch Articles (Infinite)
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
        boardIds:
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
        <div className={styles.filterContent}>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleAllToggle}
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
          <Link
            to="/create"
            className={styles.writeButton}
            state={{ from: location.search }}
          >
            글쓰기
          </Link>
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
                state={{ from: location.search }}
                className={styles.articleItem}
              >
                <div className={styles.boardName}>[{article.board.name}]</div>
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
