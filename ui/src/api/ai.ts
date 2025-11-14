import { apiClient } from './client';

export const aiApi = {
  generatePRDescription: (data: {
    title: string;
    sourceBranch: string;
    targetBranch: string;
    repoId: number;
  }) => apiClient.post<{ description: string }>('/ai/generate-pr-description', data),
  
  reviewCode: (prId: number) =>
    apiClient.post<{ review: string }>('/ai/review-code', { prId }),
  
  explainPermission: (data: { userId: string; resource: string; action: string }) =>
    apiClient.post<{ explanation: string }>('/ai/explain-permission', data),
};
