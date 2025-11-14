import { useQuery } from '@tanstack/react-query';
import { repositoriesApi } from '../api/repositories';
import { teamsApi } from '../api/teams';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { FolderGit2, Users, GitPullRequest, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { data: repositories, isLoading: reposLoading, error: reposError } = useQuery({
    queryKey: ['repositories'],
    queryFn: async () => {
      const response = await repositoriesApi.getAll();
      return response.data;
    },
  });

  const { data: teams, isLoading: teamsLoading, error: teamsError } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await teamsApi.getAll();
      return response.data;
    },
  });

  if (reposLoading || teamsLoading) return <LoadingSpinner />;
  if (reposError) return <ErrorMessage message="Failed to load repositories" />;
  if (teamsError) return <ErrorMessage message="Failed to load teams" />;

  const stats = [
    { label: 'Repositories', value: repositories?.length || 0, icon: FolderGit2, color: 'bg-blue-500' },
    { label: 'Teams', value: teams?.length || 0, icon: Users, color: 'bg-green-500' },
    { label: 'Pull Requests', value: 0, icon: GitPullRequest, color: 'bg-purple-500' },
    { label: 'Recent Activity', value: 0, icon: Activity, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Repositories</h2>
            <Link
              to="/repositories"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {repositories && repositories.length > 0 ? (
              repositories.slice(0, 5).map((repo) => (
                <Link
                  key={repo.id}
                  to={`/repositories/${repo.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{repo.name}</p>
                      <p className="text-sm text-gray-600">{repo.description || 'No description'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      repo.visibility === 'public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {repo.visibility}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No repositories yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Teams</h2>
            <Link
              to="/teams"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {teams && teams.length > 0 ? (
              teams.slice(0, 5).map((team) => (
                <Link
                  key={team.id}
                  to={`/teams/${team.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
                >
                  <p className="font-medium text-gray-900">{team.name}</p>
                  <p className="text-sm text-gray-600">{team.description || 'No description'}</p>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No teams yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
