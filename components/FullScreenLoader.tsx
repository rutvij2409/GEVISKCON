import React from 'react';
import { AnimatedAIcon } from './AnimatedAIcon';

export const FullScreenLoader: React.FC = () => (
  <div className="fixed inset-0 bg-slate-100 dark:bg-slate-950 flex flex-col justify-center items-center z-[100]">
    <AnimatedAIcon />
    <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">
      Connecting to your live inventory...
    </p>
    <p className="text-sm text-slate-500 dark:text-slate-400">
      Fetching the latest data from Google Sheets.
    </p>
  </div>
);
