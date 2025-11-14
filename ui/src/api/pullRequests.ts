import { apiClient } from './client';
import type { PullRequest, Review } from '../types';

export const pullRequestsApi = {
  getAll: () => apiClient.get<PullRequest[]>('/pull-requests'),
  
  getById: (id: number) => apiClient.get<PullRequest>(`/pull-requests/${id}`),
  
  create: (data: {
    repoId: number;
    title: string;
    description?: string;
    sourceBranch: string;
    targetBranch: string;
  }) => apiClient.post<PullRequest>('/pull-requests', data),
  
  update: (id: number, data: Partial<PullRequest>) =>
    apiClient.put<PullRequest>(`/pull-requests/${id}`, data),
  
  merge: (id: number) => apiClient.post(`/pull-requests/${id}/merge`),
  
  getReviews: (id: number) =>
    apiClient.get<Review[]>(`/pull-requests/${id}/reviews`),
  
  addReview: (id: number, status: string, comment?: string) =>
    apiClient.post(`/pull-requests/${id}/reviews`, { status, comment }),
};
