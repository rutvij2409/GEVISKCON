import { InventoryItem, ItemType, BomComponent } from '../types';

// Helper to prepare item for SheetDB (write operations), ensuring complex data like BOM is stringified.
const prepareItemForSheet = (item: InventoryItem): Omit<InventoryItem, 'bom'> & { bom: string } => {
  return {
    ...item,
    bom: item.bom ? JSON.stringify(item.bom) : '',
  };
};

// --- READ FROM SHEETDB (replaces CSV reading) ---

const parseJsonRowToInventoryItem = (row: Record<string, string>, type: ItemType): InventoryItem | null => {
  // Column names from SheetDB can have spaces replaced by _ or be cased differently.
  // Standardize by lowercasing all keys.
  const lowerRow = Object.keys(row).reduce((acc, key) => {
    acc[key.toLowerCase().replace(/_/g, '')] = row[key];
    return acc;
  }, {} as Record<string, string>);

  if (!lowerRow.name) {
    return null; // Name is mandatory
  }

  let bom: BomComponent[] | undefined = undefined;
  if (lowerRow.bom) {
    try {
      bom = JSON.parse(lowerRow.bom);
    } catch (e) {
      console.warn(`Could not parse BOM for item "${lowerRow.name}":`, lowerRow.bom);
    }
  }

  return {
    id: lowerRow.id || crypto.randomUUID(), // Generate ID if not present
    name: lowerRow.name,
    sku: lowerRow.sku || '',
    category: lowerRow.category || 'Uncategorized',
    quantity: parseFloat(lowerRow.quantity) || 0,
    price: parseFloat(lowerRow.price) || 0,
    type: type,
    date: lowerRow.date || new Date().toISOString().split('T')[0],
    lastUpdated: lowerRow.lastupdated || new Date().toISOString(),
    bom: bom,
  };
};

const fetchItemsFromSheetDb = async (url: string, type: ItemType): Promise<InventoryItem[]> => {
  if (!url) return [];
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      console.warn(`Sheet not found at ${url}. Returning empty array.`);
      return [];
    }
    throw new Error(`Failed to fetch from SheetDB at ${url}. Status: ${response.status}`);
  }
  const data = await response.json();

  if (!Array.isArray(data)) {
    console.log(`Received non-array response from SheetDB for ${url}. Assuming empty sheet.`);
    return [];
  }

  return data
    .map(row => parseJsonRowToInventoryItem(row, type))
    .filter((item): item is InventoryItem => item !== null);
};


export const fetchAllItemsFromSheets = async (
  rawMaterialApiUrl: string,
  finishedGoodsApiUrl: string
): Promise<InventoryItem[]> => {
  const rawMaterialsPromise = fetchItemsFromSheetDb(rawMaterialApiUrl, ItemType.RAW_MATERIAL);
  const finishedGoodsPromise = fetchItemsFromSheetDb(finishedGoodsApiUrl, ItemType.FINISHED_GOOD);

  const [rawMaterials, finishedGoods] = await Promise.all([
    rawMaterialsPromise,
    finishedGoodsPromise
  ]);

  return [...rawMaterials, ...finishedGoods];
};


// --- WRITE TO SHEETDB (Incremental Sync Functions) ---

function getApiUrl(itemType: ItemType, rawMaterialApiUrl: string, finishedGoodsApiUrl: string): string | null {
  if (itemType === ItemType.RAW_MATERIAL) return rawMaterialApiUrl;
  if (itemType === ItemType.FINISHED_GOOD) return finishedGoodsApiUrl;
  return null;
}

export async function addItemToSheet(item: InventoryItem, rawMaterialApiUrl: string, finishedGoodsApiUrl: string): Promise<{ success: boolean; message: string }> {
  const apiUrl = getApiUrl(item.type, rawMaterialApiUrl, finishedGoodsApiUrl);
  if (!apiUrl) return { success: true, message: "Write-sync skipped, URL not configured for this item type." };

  const sheetItem = prepareItemForSheet(item);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [sheetItem] }), // SheetDB batch-create expects an array
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add item to sheet.');
    }
    return { success: true, message: 'Item changes saved to sheet.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error.';
    return { success: false, message: `Failed to save item: ${message}` };
  }
}

export async function updateItemInSheet(item: InventoryItem, rawMaterialApiUrl: string, finishedGoodsApiUrl: string): Promise<{ success: boolean; message: string }> {
  const apiUrl = getApiUrl(item.type, rawMaterialApiUrl, finishedGoodsApiUrl);
  if (!apiUrl) return { success: true, message: "Write-sync skipped, URL not configured for this item type." };

  const sheetItem = prepareItemForSheet(item);

  try {
    // Use SKU as the unique identifier for updates
    const response = await fetch(`${apiUrl}/sku/${item.sku}`, { // Use lowercase 'sku' for consistency
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheetItem),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update item in sheet.');
    }
    return { success: true, message: 'Item changes saved to sheet.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error.';
    return { success: false, message: `Failed to update item: ${message}` };
  }
}

export async function deleteItemFromSheet(itemSku: string, itemType: ItemType, rawMaterialApiUrl: string, finishedGoodsApiUrl: string): Promise<{ success: boolean; message: string }> {
  const apiUrl = getApiUrl(itemType, rawMaterialApiUrl, finishedGoodsApiUrl);
  if (!apiUrl) return { success: true, message: "Write-sync skipped, URL not configured for this item type." };

  try {
    // Use SKU as the unique identifier for deletes
    const response = await fetch(`${apiUrl}/sku/${itemSku}`, { // Use lowercase 'sku' for consistency
      method: 'DELETE',
    });
    if (!response.ok) {
      // SheetDB returns an error if item not found, which is fine, maybe it was never synced.
      if (response.status === 404) {
        return { success: true, message: 'Item not found in sheet, considered deleted.' };
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete item from sheet.');
    }
    return { success: true, message: 'Item deleted from sheet.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error.';
    return { success: false, message: `Failed to delete item: ${message}` };
  }
}
