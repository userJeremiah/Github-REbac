import { apiClient } from './client';
import type { Team, TeamMember, TeamRepositoryAccess } from '../types';

export const teamsApi = {
  getAll: () => apiClient.get<Team[]>('/teams'),
  
  getById: (id: number) => apiClient.get<Team>(`/teams/${id}`),
  
  create: (data: { name: string; orgId: number; description?: string }) =>
    apiClient.post<Team>('/teams', data),
  
  update: (id: number, data: Partial<Team>) =>
    apiClient.put<Team>(`/teams/${id}`, data),
  
  delete: (id: number) => apiClient.delete(`/teams/${id}`),
  
  getMembers: (id: number) =>
    apiClient.get<TeamMember[]>(`/teams/${id}/members`),
  
  addMember: (id: number, email: string) =>
    apiClient.post(`/teams/${id}/members`, { email }),
  
  removeMember: (id: number, email: string) =>
    apiClient.delete(`/teams/${id}/members/${email}`),
  
  getRepositories: (id: number) =>
    apiClient.get<TeamRepositoryAccess[]>(`/teams/${id}/repositories`),
  
  addRepository: (id: number, repoId: number, role: string) =>
    apiClient.post(`/teams/${id}/repositories`, { repoId, role }),
  
  removeRepository: (id: number, repoId: number) =>
    apiClient.delete(`/teams/${id}/repositories/${repoId}`),
};
