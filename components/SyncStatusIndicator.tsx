import React from 'react';
import { Icon } from './Icon';

interface SyncStatusIndicatorProps {
  status: 'idle' | 'syncing' | 'success' | 'error';
  message: string;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ status, message }) => {
  let icon, text, textColor;

  switch (status) {
    case 'syncing':
      icon = <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
      text = 'Syncing...';
      textColor = 'text-slate-500 dark:text-slate-400';
      break;
    case 'success':
    case 'idle':
    default:
      icon = <Icon path="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5 text-green-500" />;
      text = 'Synced';
      textColor = 'text-green-600 dark:text-green-400';
      break;
    case 'error':
      icon = <Icon path="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" className="w-5 h-5 text-red-500" />;
      text = 'Sync Error';
      textColor = 'text-red-600 dark:text-red-400';
      break;
  }

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${textColor}`} title={message || text}>
      {icon}
      <span>{text}</span>
    </div>
  );
};
