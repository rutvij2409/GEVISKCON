import React, { useState, useEffect, useMemo } from 'react';
import { InventoryItem, BomComponent } from '../types';
import { Modal } from './Modal';
import { Icon } from './Icon';

interface RecordSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSale: (finishedGoodName: string, quantity: number) => void;
  finishedGoodNames: string[];
  getBomForProduct: (name: string) => { components: BomComponent[] } | null;
  rawMaterials: InventoryItem[];
}

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({ isOpen, onClose, onConfirmSale, finishedGoodNames, getBomForProduct, rawMaterials }) => {
  const [selectedGood, setSelectedGood] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setSelectedGood(finishedGoodNames.length > 0 ? finishedGoodNames[0] : '');
      setQuantity(1);
    }
  }, [isOpen, finishedGoodNames]);

  const rawMaterialTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const rm of rawMaterials) {
      totals.set(rm.name, (totals.get(rm.name) || 0) + rm.quantity);
    }
    return totals;
  }, [rawMaterials]);

  const requiredMaterials = useMemo(() => {
    if (!selectedGood) return [];
    const bom = getBomForProduct(selectedGood);
    if (!bom) return [];

    return bom.components.map(component => {
      const required = component.quantity * quantity;
      const available = rawMaterialTotals.get(component.rawMaterialName) || 0;
      return {
        name: component.rawMaterialName,
        required: required,
        available: available,
        hasEnough: available >= required,
      };
    });
  }, [selectedGood, quantity, getBomForProduct, rawMaterialTotals]);


  const canFulfillSale = requiredMaterials.every(m => m.hasEnough);

  const handleConfirm = () => {
    if (selectedGood && quantity > 0 && canFulfillSale) {
      onConfirmSale(selectedGood, quantity);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record a Sale">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="finished-good" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Finished Good
            </label>
            <select
              id="finished-good"
              value={selectedGood}
              onChange={(e) => setSelectedGood(e.target.value)}
              className="mt-1 block w-full common-input"
            >
              {finishedGoodNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sale-quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Quantity Sold
            </label>
            <input
              type="number"
              id="sale-quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="mt-1 block w-full common-input"
              min="1"
              step="1"
            />
          </div>
        </div>

        <div>
            <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">Required Raw Materials</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">This sale will deduct the following from your inventory:</p>
            {selectedGood ? (
                <div className="mt-2 space-y-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg max-h-60 overflow-y-auto">
                    {requiredMaterials.length > 0 ? requiredMaterials.map(mat => (
                        <div key={mat.name} className={`flex justify-between items-center p-2 rounded-md text-sm ${mat.hasEnough ? 'bg-slate-100 dark:bg-slate-800' : 'bg-red-100 dark:bg-red-900/50'}`}>
                           <span>{mat.name}</span>
                           <div className="flex items-center gap-2">
                                <span className={mat.hasEnough ? 'text-slate-500 dark:text-slate-400' : 'text-red-500 font-bold'}>
                                   {mat.required.toFixed(2)} / {mat.available.toFixed(2)}
                                </span>
                                {mat.hasEnough 
                                    ? <Icon path="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5 text-green-500" />
                                    : <Icon path="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" className="w-5 h-5 text-red-500" />
                                }
                           </div>
                        </div>
                    )) : <p className="text-center text-sm text-slate-500">No recipe found for this item.</p>}
                </div>
            ) : <p className="text-center text-sm text-slate-500 mt-2">Select a product to see requirements.</p>}
             {!canFulfillSale && selectedGood && (
                 <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center font-semibold">
                     Insufficient stock to fulfill this sale.
                 </p>
            )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedGood || quantity <= 0 || !canFulfillSale}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md shadow-sm hover:bg-amber-700 disabled:bg-amber-300 disabled:cursor-not-allowed"
          >
            Confirm Sale & Deduct Stock
          </button>
        </div>
        <style>{`.common-input { padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); } .dark .common-input { background-color: #1e293b; border-color: #475569; color: #e2e8f0; } .common-input:focus { outline: none; box-shadow: 0 0 0 1px #f59e0b; border-color: #f59e0b; }`}</style>
      </div>
    </Modal>
  );
};
