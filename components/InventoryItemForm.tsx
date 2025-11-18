import React, { useState, useEffect, useMemo } from 'react';
import { InventoryItem, ItemType, BomComponent } from '../types';
import { preloadedRawMaterials, getCategoryFromNameForRawMaterial } from '../data/preloadedData';

interface InventoryItemFormProps {
  item?: InventoryItem | null;
  onSave: (item: Omit<InventoryItem, 'id' | 'lastUpdated'> | InventoryItem) => void;
  onClose: () => void;
  allItems: InventoryItem[];
}

type Suggestion = {
  name: string;
  category: string;
};

export const InventoryItemForm: React.FC<InventoryItemFormProps> = ({ item, onSave, onClose, allItems }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const isEditMode = !!item;

  const allPreloadedItems = useMemo(() => [
    ...preloadedRawMaterials.map(item => ({
      name: item.name,
      category: getCategoryFromNameForRawMaterial(item.name)
    }))
  ], []);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setSku(item.sku);
      setCategory(item.category);
      setQuantity(item.quantity);
      setPrice(item.price || 0);
      setDate(item.date);
    } else {
      // For new items, reset fields
      setName('');
      setCategory('');
      setQuantity(0);
      setPrice(0);
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [item]);

  // Auto-generate SKU for new items
  useEffect(() => {
    if (!isEditMode) {
      const prefix = 'RM-';
      const itemsOfType = allItems.filter(i => i.sku.startsWith(prefix));

      let maxSkuNum = 0;
      if (itemsOfType.length > 0) {
        maxSkuNum = itemsOfType.reduce((max, currentItem) => {
          const num = parseInt(currentItem.sku.replace(prefix, ''), 10);
          return !isNaN(num) && num > max ? num : max;
        }, 0);
      }

      const newSku = `${prefix}${String(maxSkuNum + 1).padStart(4, '0')}`;
      setSku(newSku);
    }
  }, [isEditMode, allItems]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (value) {
      const filteredSuggestions = allPreloadedItems.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions.slice(0, 10)); // Limit suggestions
      setDropdownOpen(true);
    } else {
      setSuggestions([]);
      setDropdownOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setName(suggestion.name);
    setCategory(suggestion.category);
    setSuggestions([]);
    setDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      sku,
      category,
      quantity,
      price,
      date,
      type: ItemType.RAW_MATERIAL // Always raw material
    };

    if (isEditMode) {
      onSave({ ...item, ...payload });
    } else {
      onSave(payload);
    }
  };

  const isFormValid = name && sku && category && quantity >= 0 && price >= 0 && date;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Raw Material Name
        </label>
        {isEditMode ? (
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            placeholder="e.g., Organic Cotton"
            required
          />
        ) : (
          <div className="relative">
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              onFocus={() => name && suggestions.length > 0 && setDropdownOpen(true)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 150)} // Delay to allow click
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              placeholder="Search or enter a new material name..."
              required
              autoComplete="off"
            />
            {isDropdownOpen && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={`${suggestion.name}-${index}`}
                    onMouseDown={() => handleSuggestionClick(suggestion)} // Use onMouseDown to fire before onBlur
                    className="px-3 py-2 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/50"
                  >
                    <p className="font-medium text-slate-800 dark:text-slate-200">{suggestion.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{suggestion.category}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            SKU {!isEditMode && <span className="text-xs text-slate-500">(auto-generated)</span>}
          </label>
          <input
            type="text"
            id="sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 read-only:bg-slate-100 read-only:cursor-not-allowed dark:read-only:bg-slate-700"
            placeholder="e.g., CTN-001"
            required
            readOnly={!isEditMode}
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Category
          </label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            placeholder="e.g., Fabrics"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(0, parseFloat(e.target.value) || 0))}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            required
            step="0.01"
          />
        </div>
         <div>
          <label htmlFor="price" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Unit Price
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            required
            step="0.01"
          />
        </div>
        <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Date
            </label>
            <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                required
            />
        </div>
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
          type="submit"
          disabled={!isFormValid}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-amber-300 disabled:cursor-not-allowed"
        >
          {isEditMode ? 'Save Changes' : 'Add Material'}
        </button>
      </div>
    </form>
  );
};
