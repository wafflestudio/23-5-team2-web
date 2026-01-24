import type { AxiosError } from 'axios';
import type {
  Article,
  ArticleFilterParams,
  ArticleListResponse,
  CreateArticleRequest,
} from '../types/article';
import { api } from './instance';

export const createArticle = async (
  data: CreateArticleRequest
): Promise<Article> => {
  // Hardcoding boardId to 1 as backend likely requires it
  const response = await api.post<Article>('/v1/articles', {
    ...data,
  });
  return response.data;
};

export const updateArticle = async (
  articleId: number,
  data: Partial<CreateArticleRequest>
): Promise<Article> => {
  const response = await api.patch<Article>(`/v1/articles/${articleId}`, data);
  return response.data;
};

export const getArticles = async (
  params: ArticleFilterParams
): Promise<ArticleListResponse> => {
  const response = await api.get<ArticleListResponse>('/v1/articles', {
    params,
  });
  return response.data;
};

export const getArticleDetail = async (articleId: number): Promise<Article> => {
  const response = await api.get<Article>(`/v1/articles/${articleId}`);
  return response.data;
};

export const deleteArticle = async (articleId: number): Promise<void> => {
  await api.delete(`/v1/articles/${articleId}`);
};

export const getArticleLikes = async (articleId: number): Promise<boolean> => {
  try {
    await api.get(`/v1/likes/${articleId}`);
    return true;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response?.status === 404) {
      return false;
    }
    throw error;
  }
};

export const getArticleDislikes = async (
  articleId: number
): Promise<boolean> => {
  try {
    await api.get(`/v1/dislikes/${articleId}`);
    return true;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response?.status === 404) {
      return false;
    }
    throw error;
  }
};

export const likeArticle = async (articleId: number): Promise<void> => {
  await api.post('/v1/likes', { articleId });
};

export const unlikeArticle = async (articleId: number): Promise<void> => {
  await api.delete(`/v1/likes/${articleId}`);
};

export const dislikeArticle = async (articleId: number): Promise<void> => {
  await api.post('/v1/dislikes', { articleId });
};

export const undislikeArticle = async (articleId: number): Promise<void> => {
  await api.delete(`/v1/dislikes/${articleId}`);
};
