import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { InventoryItem, ItemType } from '../types';

interface TableActionsProps {
  item: InventoryItem;
  onUpdateStock: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TableActions: React.FC<TableActionsProps> = ({ item, onUpdateStock, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-slate-800"
      >
        <Icon path="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
      </button>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            <button onClick={() => handleAction(onUpdateStock)} className="action-item" role="menuitem">
              <Icon path="M12 4.5v15m7.5-7.5h-15" className="mr-3" /> Update Stock
            </button>
            <button onClick={() => handleAction(onEdit)} className="action-item" role="menuitem">
              <Icon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" className="mr-3"/> Edit Item
            </button>
            <button onClick={() => handleAction(onDelete)} className="action-item text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50" role="menuitem">
              <Icon path="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" className="mr-3"/> Delete Item
            </button>
          </div>
        </div>
      )}
      <style>{`
          .action-item {
            display: flex;
            align-items: center;
            width: 100%;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            text-align: left;
            color: #374151; /* slate-700 */
          }
          .dark .action-item {
            color: #d1d5db; /* slate-300 */
          }
          .action-item:hover {
            background-color: #f3f4f6; /* slate-100 */
          }
          .dark .action-item:hover {
            background-color: #374151; /* slate-700 */
          }
          .action-item svg {
            width: 1.25rem;
            height: 1.25rem;
          }
      `}</style>
    </div>
  );
};
