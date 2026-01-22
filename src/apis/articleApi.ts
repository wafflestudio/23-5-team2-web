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
    boardId: 1,
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
  // console.log(response.data);
  return response.data;
};

export const getArticleDetail = async (articleId: number): Promise<Article> => {
  const response = await api.get<Article>(`/v1/articles/${articleId}`);
  return response.data;
};
