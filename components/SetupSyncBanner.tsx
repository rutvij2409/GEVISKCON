import React from 'react';
import { Icon } from './Icon';

interface SetupSyncBannerProps {
  onConfigure: () => void;
}

export const SetupSyncBanner: React.FC<SetupSyncBannerProps> = ({ onConfigure }) => (
  <div className="bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 p-4 rounded-lg mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4">
    <div className="flex items-start sm:items-center gap-4">
      <div className="flex-shrink-0">
        <div className="bg-indigo-200 dark:bg-indigo-800 p-3 rounded-full">
            <Icon path="M17.25 9.75v-2.625L12 4.875l-5.25 2.25v2.625m10.5 0v5.625c0 1.054-.424 2.013-1.172 2.734l-4.078 3.568a1.5 1.5 0 01-1.999 0l-4.078-3.568A3.75 3.75 0 013 15.375V9.75m14.25 0l-5.25-2.25m-3.75 0l-5.25 2.25m9 3.75l-3.75 1.875-3.75-1.875" className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200">Connect to Google Sheets for Real-Time Sync</h3>
        <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
          Automatically back up your inventory and keep your data safe. Any changes you make here—adding, editing, or deleting items—will instantly reflect in your sheet.
        </p>
      </div>
    </div>
    <button
      onClick={onConfigure}
      className="flex-shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Configure Sync Now
    </button>
  </div>
);
