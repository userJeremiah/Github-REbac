import { Link, useLocation } from 'react-router-dom';
import { Home, FolderGit2, Users, GitPullRequest, Network, FileText } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/repositories', label: 'Repositories', icon: FolderGit2 },
  { path: '/teams', label: 'Teams', icon: Users },
  { path: '/pull-requests', label: 'Pull Requests', icon: GitPullRequest },
  { path: '/permissions', label: 'Permissions', icon: Network },
  { path: '/audit-log', label: 'Audit Log', icon: FileText },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">GitHub ReBAC</h1>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
