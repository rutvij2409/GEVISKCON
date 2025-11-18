export enum ItemType {
  RAW_MATERIAL = 'Raw Material',
  FINISHED_GOOD = 'Finished Good',
}

export interface BomComponent {
  rawMaterialName: string;
  quantity: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  type: ItemType;
  date: string;
  lastUpdated: string;
  bom?: BomComponent[];
}
