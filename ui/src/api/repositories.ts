import { apiClient } from './client';
import type { Repository, Collaborator } from '../types';

export const repositoriesApi = {
  getAll: () => apiClient.get<Repository[]>('/repositories'),
  
  getById: (id: number) => apiClient.get<Repository>(`/repositories/${id}`),
  
  create: (data: { name: string; orgId: number; visibility: 'public' | 'private'; description?: string }) =>
    apiClient.post<Repository>('/repositories', data),
  
  update: (id: number, data: Partial<Repository>) =>
    apiClient.put<Repository>(`/repositories/${id}`, data),
  
  delete: (id: number) => apiClient.delete(`/repositories/${id}`),
  
  getCollaborators: (id: number) =>
    apiClient.get<Collaborator[]>(`/repositories/${id}/collaborators`),
  
  addCollaborator: (id: number, email: string, role: string) =>
    apiClient.post(`/repositories/${id}/collaborators`, { email, role }),
  
  removeCollaborator: (id: number, email: string) =>
    apiClient.delete(`/repositories/${id}/collaborators/${email}`),
};
