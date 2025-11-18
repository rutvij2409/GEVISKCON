import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Modal } from './Modal';

interface UpdateStockModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (itemId: string, quantityChange: number) => void;
}

export const UpdateStockModal: React.FC<UpdateStockModalProps> = ({ item, isOpen, onClose, onUpdate }) => {
  const [change, setChange] = useState<number>(0);

  if (!item) return null;

  const handleUpdate = () => {
    if (change !== 0) {
      onUpdate(item.id, change);
    }
    onClose();
    setChange(0);
  };

  const finalQuantity = item.quantity + change;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Update Stock for ${item.name}`}>
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
          <span className="font-medium text-slate-600 dark:text-slate-300">Current Stock:</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{item.quantity.toFixed(2)}</span>
        </div>
        <div>
          <label htmlFor="stock-change" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Stock Change (Purchase/Usage)
          </label>
          <input
            type="number"
            id="stock-change"
            value={change}
            onChange={(e) => setChange(parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            placeholder="e.g., 50 for purchase, -20 for usage"
          />
        </div>
        <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
          <span className="font-medium text-slate-600 dark:text-slate-300">New Stock:</span>
          <span className={`text-2xl font-bold ${finalQuantity < 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
            {finalQuantity.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Update Stock
          </button>
        </div>
      </div>
    </Modal>
  );
};
