import { useState, useEffect, useCallback } from 'react';
import { InventoryItem, ItemType } from '../types';
import { fetchAllItemsFromSheets } from '../services/sheetService';
import { preloadedRawMaterials, getCategoryFromNameForRawMaterial } from '../data/preloadedData';
// FIX: Import getBomForProduct to resolve reference error.
import { getBomForProduct } from '../services/bomService';

const STORAGE_KEY = 'inventoryApp.items';

const createInitialRawMaterials = (): InventoryItem[] => {
  return preloadedRawMaterials.map((item, index) => ({
    id: crypto.randomUUID(),
    name: item.name,
    sku: `RM-${String(index + 1).padStart(4, '0')}`,
    category: getCategoryFromNameForRawMaterial(item.name),
    quantity: 0,
    price: 0,
    type: ItemType.RAW_MATERIAL,
    date: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString(),
  }));
};

const getInitialItems = () => {
  // Only load raw materials initially. Finished goods are virtual.
  return createInitialRawMaterials();
};

interface UseInventoryProps {
  rawMaterialSheetApiUrl: string;
  finishedGoodsSheetApiUrl: string;
}

export function useInventory({ rawMaterialSheetApiUrl, finishedGoodsSheetApiUrl }: UseInventoryProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItemsFromSheets = useCallback(async () => {
    if (!rawMaterialSheetApiUrl) {
      console.warn("SheetDB API URL not configured.");
      return null;
    }
    try {
      const fetchedItems = await fetchAllItemsFromSheets(rawMaterialSheetApiUrl, finishedGoodsSheetApiUrl);
      console.log(`Fetched ${fetchedItems.length} items from Google Sheets.`);
      return fetchedItems.filter(item => item.type === ItemType.RAW_MATERIAL);
    } catch (error) {
      console.error("Failed to fetch from Google Sheets:", error);
      return null;
    }
  }, [rawMaterialSheetApiUrl, finishedGoodsSheetApiUrl]);

  useEffect(() => {
    const initialize = async () => {
      try {
        let loadedItems = await loadItemsFromSheets();

        if (loadedItems) {
          setItems(loadedItems);
        } else {
          try {
            const storedItems = window.localStorage.getItem(STORAGE_KEY);
            const parsedItems = storedItems ? JSON.parse(storedItems) : [];
            if (parsedItems.length > 0) {
              setItems(parsedItems.filter(i => i.type === ItemType.RAW_MATERIAL));
            } else {
              setItems(getInitialItems());
            }
          } catch (error) {
            console.error('Error reading from localStorage, seeding with initial data.', error);
            setItems(getInitialItems());
          }
        }
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [loadItemsFromSheets]);

  useEffect(() => {
    if (items.length > 0) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Error writing to localStorage', error);
      }
    }
  }, [items]);

  const refreshItemsFromSheets = useCallback(async () => {
    const freshItems = await loadItemsFromSheets();
    if (freshItems) {
      setItems(freshItems);
      return { success: true };
    }
    return { success: false };
  }, [loadItemsFromSheets]);

  const addItem = useCallback((itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>): InventoryItem => {
    const newItem: InventoryItem = {
      ...itemData,
      id: crypto.randomUUID(),
      quantity: parseFloat(itemData.quantity.toFixed(2)),
      lastUpdated: new Date().toISOString(),
      type: ItemType.RAW_MATERIAL, // Force type to raw material
    };
    setItems(prev => [...prev, newItem]);
    return newItem;
  }, []);


  const updateItemStock = useCallback((itemId: string, quantityChange: number): InventoryItem | undefined => {
    let updatedItem: InventoryItem | undefined;
    setItems(prevItems => prevItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + quantityChange;
        updatedItem = {
          ...item,
          quantity: Math.max(0, parseFloat(newQuantity.toFixed(2))),
          lastUpdated: new Date().toISOString(),
        };
        return updatedItem;
      }
      return item;
    }));
    return updatedItem;
  }, []);

  const recordSale = useCallback((finishedGoodName: string, quantitySold: number): {
    success: boolean;
    changedItems: InventoryItem[];
    error?: string;
  } => {
    const bom = getBomForProduct(finishedGoodName);
    if (!bom) {
      return { success: false, changedItems: [], error: `Recipe for "${finishedGoodName}" not found.` };
    }

    // Check for sufficient stock first
    for (const component of bom.components) {
      const material = items.find(i => i.type === ItemType.RAW_MATERIAL && i.name === component.rawMaterialName);
      const requiredQty = component.quantity * quantitySold;
      if (!material || material.quantity < requiredQty) {
        return {
          success: false,
          changedItems: [],
          error: `Not enough stock for "${component.rawMaterialName}". Required: ${requiredQty.toFixed(2)}, Available: ${(material?.quantity || 0).toFixed(2)}.`
        };
      }
    }

    const itemsToUpdate: InventoryItem[] = [];
    for (const component of bom.components) {
      const material = items.find(i => i.type === ItemType.RAW_MATERIAL && i.name === component.rawMaterialName);
      if (material) {
        const requiredQty = component.quantity * quantitySold;
        const updatedItem = {
          ...material,
          quantity: parseFloat((material.quantity - requiredQty).toFixed(2)),
          lastUpdated: new Date().toISOString()
        };
        itemsToUpdate.push(updatedItem);
      }
    }

    setItems(currentItems => {
      const itemsMap = new Map(currentItems.map(i => [i.id, i]));
      for (const updatedItem of itemsToUpdate) {
        itemsMap.set(updatedItem.id, updatedItem);
      }
      return Array.from(itemsMap.values());
    });

    return {
      success: true,
      changedItems: itemsToUpdate,
    };
  }, [items]);

  const deleteItem = useCallback((itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  }, []);

  const editItem = useCallback((updatedItem: InventoryItem): InventoryItem => {
    const itemWithDate = {
      ...updatedItem,
      quantity: parseFloat(updatedItem.quantity.toFixed(2)),
      price: parseFloat(String(updatedItem.price || 0)),
      lastUpdated: new Date().toISOString()
    };
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === updatedItem.id ?
        itemWithDate :
        item
      )
    );
    return itemWithDate;
  }, []);


  return { items, addItem, updateItemStock, deleteItem, editItem, loading, refreshItemsFromSheets, recordSale };
}
