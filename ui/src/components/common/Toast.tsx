import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export const Toast = () => {
  const { notifications, removeNotification } = useNotification();

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-center gap-3 p-4 border rounded-lg shadow-lg min-w-[300px] ${colors[notification.type]}`}
        >
          {icons[notification.type]}
          <p className="flex-1">{notification.message}</p>
          <button
            onClick={() => removeNotification(notification.id)}
            className="hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
