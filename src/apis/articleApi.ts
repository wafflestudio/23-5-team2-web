import type {
  Article,
  ArticleFilterParams,
  ArticleListResponse,
} from '../types/article';
import { api } from './instance';

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
