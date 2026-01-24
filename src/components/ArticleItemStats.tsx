import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import {
  dislikeArticle,
  getArticleDislikes,
  getArticleLikes,
  likeArticle,
  undislikeArticle,
  unlikeArticle,
} from '../apis/articleApi';
import { useUserStore } from '../store/useUserStore';
import styles from './ArticleItemStats.module.css';

interface Props {
  articleId: number;
  likeCount: number;
  dislikeCount: number;
  isLiked?: boolean; // Optional prop if we want to pass it
  isDisliked?: boolean;
}

const ArticleItemStats = ({
  articleId,
  likeCount,
  dislikeCount,
  isLiked,
  isDisliked,
}: Props) => {
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  const { data: initialIsLiked = false } = useQuery({
    queryKey: ['isLiked', articleId],
    queryFn: () => getArticleLikes(articleId),
    enabled: !!user && isLiked === undefined,
    initialData: isLiked,
    retry: false,
  });

  const { data: initialIsDisliked = false } = useQuery({
    queryKey: ['isDisliked', articleId],
    queryFn: () => getArticleDislikes(articleId),
    enabled: !!user && isDisliked === undefined,
    initialData: isDisliked,
    retry: false,
  });

  // Local state for display
  const [likes, setLikes] = useState(likeCount);
  const [dislikes, setDislikes] = useState(dislikeCount);

  // Sync with props whenever they change (e.g. after successful invalidation)
  useEffect(() => {
    setLikes(likeCount);
  }, [likeCount]);

  useEffect(() => {
    setDislikes(dislikeCount);
  }, [dislikeCount]);

  // Track interaction state locally (best effort)
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);

  // Sync like status with API data
  useEffect(() => {
    if (user && initialIsLiked) {
      setHasLiked(true);
    } else if (!user) {
      setHasLiked(false);
    }
  }, [initialIsLiked, user]);

  useEffect(() => {
    if (user && initialIsDisliked) {
      setHasDisliked(true);
    } else if (!user) {
      setHasDisliked(false);
    }
  }, [initialIsDisliked, user]);

  // Like Mutations
  const likeMutation = useMutation({
    mutationFn: () => likeArticle(articleId),
    onMutate: async () => {
      // Optimistic update
      setLikes((prev) => prev + 1);
      setHasLiked(true);
      if (hasDisliked) {
        setDislikes((prev) => Math.max(0, prev - 1));
        setHasDisliked(false);
      }
    },
    onError: (error: AxiosError) => {
      console.error('Like Failed', error);
      // On error, invalidate to ensure we are in sync with server
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
      queryClient.invalidateQueries({ queryKey: ['isLiked', articleId] });
      queryClient.invalidateQueries({ queryKey: ['isDisliked', articleId] });
      setHasLiked(false);

      if (error.response?.status === 409) {
        setHasLiked(true);
      }
    },
    onSettled: () => {
      // Refetch global list and detail to get updated counts
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
      queryClient.invalidateQueries({ queryKey: ['isLiked', articleId] });
      queryClient.invalidateQueries({ queryKey: ['isDisliked', articleId] });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () => unlikeArticle(articleId),
    onMutate: async () => {
      setLikes((prev) => Math.max(0, prev - 1));
      setHasLiked(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
      queryClient.invalidateQueries({ queryKey: ['isLiked', articleId] });
      queryClient.invalidateQueries({ queryKey: ['isDisliked', articleId] });
    },
  });

  // Dislike Mutations
  const dislikeMutation = useMutation({
    mutationFn: () => dislikeArticle(articleId),
    onMutate: async () => {
      setDislikes((prev) => prev + 1);
      setHasDisliked(true);
      if (hasLiked) {
        setLikes((prev) => Math.max(0, prev - 1));
        setHasLiked(false);
      }
    },
    onError: (error: AxiosError) => {
      console.error('Dislike Failed', error);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
      queryClient.invalidateQueries({ queryKey: ['isLiked', articleId] });
      queryClient.invalidateQueries({ queryKey: ['isDisliked', articleId] });
      setHasDisliked(false);

      if (error.response?.status === 409) {
        setHasDisliked(true);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
      queryClient.invalidateQueries({ queryKey: ['isLiked', articleId] });
      queryClient.invalidateQueries({ queryKey: ['isDisliked', articleId] });
    },
  });

  const undislikeMutation = useMutation({
    mutationFn: () => undislikeArticle(articleId),
    onMutate: async () => {
      setDislikes((prev) => Math.max(0, prev - 1));
      setHasDisliked(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
      queryClient.invalidateQueries({ queryKey: ['isLiked', articleId] });
      queryClient.invalidateQueries({ queryKey: ['isDisliked', articleId] });
    },
  });

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      // Non-interactive for guests (though onClick is conditional below)
      return;
    }
    if (hasLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      return;
    }
    if (hasDisliked) {
      undislikeMutation.mutate();
    } else {
      dislikeMutation.mutate();
    }
  };

  return (
    <div className={styles.statsContainer}>
      <div
        className={`${styles.statItem} ${user ? styles.clickable : ''} ${hasLiked ? styles.active : ''}`}
        title={user ? '좋아요' : undefined}
        onClick={user ? handleLike : undefined}
      >
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill={hasLiked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
        <span>{(likes || 0).toLocaleString()}</span>
      </div>
      <div
        className={`${styles.statItem} ${user ? styles.clickable : ''} ${hasDisliked ? styles.active : ''}`}
        title={user ? '싫어요' : undefined}
        onClick={user ? handleDislike : undefined}
      >
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill={hasDisliked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
        </svg>
        <span>{(dislikes || 0).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default ArticleItemStats;
