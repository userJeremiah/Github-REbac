import { AlertCircle } from 'lucide-react';

export const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
};
