import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useInventory } from './hooks/useInventory';
import { InventoryItem, ItemType } from './types';
import { Icon } from './components/Icon';
import { InventoryItemForm } from './components/InventoryItemForm';
import { Modal } from './components/Modal';
import { UpdateStockModal } from './components/UpdateStockModal';
import { AnalysisModal } from './components/AnalysisModal';
import { SettingsModal, AppSettings } from './components/SettingsModal';
import { RecordSaleModal } from './components/RecordSaleModal';
import { addItemToSheet, updateItemInSheet, deleteItemFromSheet } from './services/sheetService';
import { sendLowStockAlert } from './services/emailService';
import { SyncStatusIndicator } from './components/SyncStatusIndicator';
import { LoginScreen } from './components/LoginScreen';
import { AnimatedAIcon } from './components/AnimatedAIcon';
import { ChatModal } from './components/ChatModal';
import { FullScreenLoader } from './components/FullScreenLoader';
import { useToast } from './contexts/ToastContext';
import { Dashboard } from './components/Dashboard';
import { TableActions } from './components/TableActions';
import { getAllFinishedGoodNames, getBomForProduct } from './services/bomService';
import { SetupSyncBanner } from './components/SetupSyncBanner';

// Local Storage Keys
const NOTIFICATION_EMAIL_KEY = 'inventoryApp.notificationEmail';
const LOW_STOCK_THRESHOLD_KEY = 'inventoryApp.lowStockThreshold';
const EMAILJS_SERVICE_ID_KEY = 'inventoryApp.emailJsServiceId';
const EMAILJS_TEMPLATE_ID_KEY = 'inventoryApp.emailJsTemplateId';
const EMAILJS_PUBLIC_KEY_KEY = 'inventoryApp.emailJsPublicKey';
const THEME_KEY = 'inventoryApp.theme';
const SHEETDB_URL_KEY = 'inventoryApp.sheetDbUrl';

type SortKey = 'name' | 'category' | 'quantity' | 'price' | 'value' | 'date';
type AppView = 'dashboard' | 'inventory';

const ViewTab: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  iconPath: string;
}> = ({ label, isActive, onClick, iconPath }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-colors
      ${isActive
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
        : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-700/50'
      }`
    }
    aria-current={isActive ? 'page' : undefined}
  >
    <Icon path={iconPath} className="w-5 h-5" />
    {label}
  </button>
);


export default function App() {
  // App Settings State
  const [notificationEmail, setNotificationEmail] = useState(() => localStorage.getItem(NOTIFICATION_EMAIL_KEY) || '');
  const [lowStockThreshold, setLowStockThreshold] = useState(() => {
    const storedValue = localStorage.getItem(LOW_STOCK_THRESHOLD_KEY);
    return storedValue ? parseInt(storedValue, 10) : 10;
  });
  const [emailJsServiceId, setEmailJsServiceId] = useState(() => localStorage.getItem(EMAILJS_SERVICE_ID_KEY) || '');
  const [emailJsTemplateId, setEmailJsTemplateId] = useState(() => localStorage.getItem(EMAILJS_TEMPLATE_ID_KEY) || '');
  const [emailJsPublicKey, setEmailJsPublicKey] = useState(() => localStorage.getItem(EMAILJS_PUBLIC_KEY_KEY) || '');
  const [sheetDbUrl, setSheetDbUrl] = useState(() => localStorage.getItem(SHEETDB_URL_KEY) || '');

  // Derive sheet-specific API URLs from the base URL
  const rawMaterialSheetApiUrl = useMemo(() => sheetDbUrl ? `${sheetDbUrl}?sheet=Raw%20Material` : '', [sheetDbUrl]);
  const finishedGoodsSheetApiUrl = useMemo(() => sheetDbUrl ? `${sheetDbUrl}?sheet=Finished%20Goods` : '', [sheetDbUrl]);

  const { items, addItem, updateItemStock, deleteItem, editItem, loading, refreshItemsFromSheets, recordSale } = useInventory({
    rawMaterialSheetApiUrl,
    finishedGoodsSheetApiUrl,
  });

  const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
  const [isUpdateStockModalOpen, setUpdateStockModalOpen] = useState(false);
  const [isAnalysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isRecordSaleModalOpen, setRecordSaleModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const addToast = useToast();

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  // Filtering and Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const [syncState, setSyncState] = useState<{ status: 'idle' | 'syncing' | 'error' | 'success'; message: string }>({ status: 'idle', message: '' });

  const handleLogin = (username: string, password: string) => {
    const validUsers = [
      { user: 'pratik_2412', pass: 'Ramram@213' },
      { user: 'laxmandas', pass: 'Iskcon@gev' }
    ];

    const foundUser = validUsers.find(cred => cred.user === username && cred.pass === password);

    if (foundUser) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleSaveSettings = (settings: AppSettings) => {
    localStorage.setItem(NOTIFICATION_EMAIL_KEY, settings.notificationEmail);
    setNotificationEmail(settings.notificationEmail);

    localStorage.setItem(LOW_STOCK_THRESHOLD_KEY, String(settings.lowStockThreshold));
    setLowStockThreshold(settings.lowStockThreshold);

    localStorage.setItem(EMAILJS_SERVICE_ID_KEY, settings.emailJsServiceId);
    setEmailJsServiceId(settings.emailJsServiceId);

    localStorage.setItem(EMAILJS_TEMPLATE_ID_KEY, settings.emailJsTemplateId);
    setEmailJsTemplateId(settings.emailJsTemplateId);

    localStorage.setItem(EMAILJS_PUBLIC_KEY_KEY, settings.emailJsPublicKey);
    setEmailJsPublicKey(settings.emailJsPublicKey);

    localStorage.setItem(SHEETDB_URL_KEY, settings.sheetDbUrl);
    setSheetDbUrl(settings.sheetDbUrl);

    setSettingsModalOpen(false);
  };

  const handleRefreshFromSheets = async () => {
    if (!sheetDbUrl) {
      addToast({ type: 'error', message: 'Please configure your SheetDB URL in Settings first.' });
      return;
    }
    const result = await refreshItemsFromSheets();
    if (result.success) {
      addToast({ type: 'success', message: 'Successfully refreshed data from Google Sheets!' });
    } else {
      addToast({ type: 'error', message: 'Error refreshing data. Check settings and connection.' });
    }
  };

  const syncMultipleItems = async (itemsToSync: InventoryItem[]) => {
    if (!sheetDbUrl) {
      console.warn("Sync skipped: SheetDB URL not configured.");
      return;
    }
    setSyncState({ status: 'syncing', message: `Syncing ${itemsToSync.length} items...` });
    try {
      const results = await Promise.all(
        itemsToSync.map(item => updateItemInSheet(item, rawMaterialSheetApiUrl, finishedGoodsSheetApiUrl))
      );

      const failedSyncs = results.filter(r => !r.success);
      if (failedSyncs.length > 0) {
        throw new Error(`Failed to sync ${failedSyncs.length} item(s).`);
      }

      setSyncState({ status: 'success', message: 'All changes saved to sheet.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error during sync.';
      setSyncState({ status: 'error', message });
      addToast({ type: 'error', message });
    }
    setTimeout(() => setSyncState(prev => prev.status === 'syncing' ? prev : { status: 'idle', message: '' }), 3000);
  };

  const handleOpenAddModal = () => {
    setSelectedItem(null);
    setAddEditModalOpen(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setAddEditModalOpen(true);
  };

  const handleOpenUpdateStockModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setUpdateStockModalOpen(true);
  };

  const handleCloseModals = () => {
    setAddEditModalOpen(false);
    setUpdateStockModalOpen(false);
    setSelectedItem(null);
  };

  const handleSaveItem = (itemData: Omit<InventoryItem, 'id' | 'lastUpdated'> | InventoryItem) => {
    if ('id' in itemData) {
      // EDIT operation
      const updatedItem = editItem(itemData);
      syncMultipleItems([updatedItem]);
      addToast({ type: 'success', message: `"${updatedItem.name}" updated successfully.` });
    } else {
      // ADD operation
      const existingItem = items.find(i => i.name === itemData.name && i.type === ItemType.RAW_MATERIAL);

      if (existingItem) {
        // Update stock of existing item
        const updatedItem = updateItemStock(existingItem.id, itemData.quantity);
        if (updatedItem) {
          syncMultipleItems([updatedItem]);
          addToast({ type: 'success', message: `Stock for "${updatedItem.name}" updated by ${itemData.quantity}.` });
        }
      } else {
        // Add as a completely new item
        const newItem = addItem(itemData);
        addToast({ type: 'success', message: `New material "${newItem.name}" added.` });
        if (sheetDbUrl) {
          setSyncState({ status: 'syncing', message: 'Syncing new item...' });
          addItemToSheet(newItem, rawMaterialSheetApiUrl, finishedGoodsSheetApiUrl).then(result => {
            if (result.success) {
              setSyncState({ status: 'success', message: 'Item saved to sheet.' });
            } else {
              setSyncState({ status: 'error', message: result.message });
            }
          });
        }
      }
    }
    handleCloseModals();
  };

  const handleUpdateStock = (itemId: string, quantityChange: number) => {
    const itemBeforeUpdate = items.find(i => i.id === itemId);
    if (!itemBeforeUpdate) return;

    const updatedItem = updateItemStock(itemId, quantityChange);

    if (updatedItem) {
      syncMultipleItems([updatedItem]);

      const wasAboveThreshold = itemBeforeUpdate.quantity > lowStockThreshold;
      const isBelowThreshold = updatedItem.quantity <= lowStockThreshold;

      if (wasAboveThreshold && isBelowThreshold && notificationEmail && emailJsServiceId && emailJsTemplateId && emailJsPublicKey) {
        console.log(`Item ${updatedItem.name} dropped below low stock threshold. Sending email.`);
        sendLowStockAlert(
          { serviceId: emailJsServiceId, templateId: emailJsTemplateId, publicKey: emailJsPublicKey },
          { recipientEmail: notificationEmail, threshold: lowStockThreshold, item: updatedItem, newQuantity: updatedItem.quantity }
        ).then(result => console.log(result.message));
      }
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this raw material?')) {
      const itemToDelete = items.find(i => i.id === itemId);
      if (itemToDelete) {
        deleteItem(itemId);
        if (sheetDbUrl) {
          setSyncState({ status: 'syncing', message: 'Deleting item...' });
          deleteItemFromSheet(itemToDelete.sku, itemToDelete.type, rawMaterialSheetApiUrl, finishedGoodsSheetApiUrl).then(result => {
            if (result.success) {
              setSyncState({ status: 'success', message: 'Item deleted from sheet.' });
              addToast({ type: 'info', message: `"${itemToDelete.name}" has been deleted.` });
            } else {
              setSyncState({ status: 'error', message: result.message });
            }
          });
        }
      }
    }
  };

  const handleRecordSale = (finishedGoodName: string, quantitySold: number) => {
    const result = recordSale(finishedGoodName, quantitySold);
    if (result.success) {
      syncMultipleItems(result.changedItems);
      addToast({ type: 'success', message: `Sale of ${quantitySold} x ${finishedGoodName} recorded. Stock updated.` });
    } else {
      addToast({ type: 'error', message: result.error || 'Failed to record sale.' });
    }
    setRecordSaleModalOpen(false);
  };

  const filteredItems = useMemo(() => {
    // The main list now only contains raw materials
    return items.filter(item => {
      return item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [items, searchTerm]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const { key, direction } = sortConfig;
      const aVal = key === 'value' ? a.quantity * (a.price || 0) : a[key];
      const bVal = key === 'value' ? b.quantity * (b.price || 0) : b[key];

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else {
        if (aVal > bVal) comparison = 1;
        if (aVal < bVal) comparison = -1;
      }
      return direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredItems, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} error={loginError} />;
  }

  if (loading) {
    return <FullScreenLoader />;
  }

  const renderSortArrow = (key: SortKey) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  return (
    <>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                    <AnimatedAIcon size="small" />
                    <h1 className="text-xl font-bold tracking-tight">Inventory Stock Planner</h1>
                </div>
                <div className="flex items-center gap-4">
                    <SyncStatusIndicator status={syncState.status} message={syncState.message} />
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <Icon path={theme === 'light' ? "M12 3v2.25m6.364.364l-1.591 1.591M21 12h-2.25m-.364 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M12 21a9 9 0 110-18 9 9 0 010 18z" : "M12 3v2.25m6.364.364l-1.591 1.591M21 12h-2.25m-.364 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M12 21a9 9 0 110-18 9 9 0 010 18z"} className="w-6 h-6" />
                    </button>
                    <button onClick={() => setSettingsModalOpen(true)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <Icon path="M10.343 3.94c.09-.542.56-1.002 1.11-1.226l.28-.112a1.06 1.06 0 011.042 1.53l-.286.476a1.06 1.06 0 00.303 1.341l.412.348a1.06 1.06 0 010 1.638l-.412.348a1.06 1.06 0 00-.303 1.341l.286.476a1.06 1.06 0 01-1.042 1.53l-.28-.112a1.06 1.06 0 00-1.11-1.226c-.542-.09-1.002.56-1.226 1.11l-.112.28a1.06 1.06 0 01-1.53 1.042l-.476-.286a1.06 1.06 0 00-1.341.303l-.348.412a1.06 1.06 0 01-1.638 0l-.348-.412a1.06 1.06 0 00-1.341-.303l-.476.286a1.06 1.06 0 01-1.53-1.042l-.112-.28a1.06 1.06 0 00-1.226-1.11c-.09.542-.56 1.002-1.11 1.226l-.28.112a1.06 1.06 0 01-1.042-1.53l.286-.476a1.06 1.06 0 00.303-1.341l-.412-.348a1.06 1.06 0 010-1.638l.412-.348a1.06 1.06 0 00.303-1.341l-.286-.476a1.06 1.06 0 011.042-1.53l.28.112c.542.09 1.002-.56 1.226-1.11l.112-.28a1.06 1.06 0 011.53-1.042l.476.286a1.06 1.06 0 001.341-.303l.348-.412a1.06 1.06 0 011.638 0l.348.412a1.06 1.06 0 001.341.303l.476-.286a1.06 1.06 0 011.53 1.042l.112.28c.224.549.684 1.01 1.226 1.11zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
                    </button>
                    <button onClick={handleLogout} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <Icon path="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </button>
                </div>
            </div>
          </div>
        </header>

        <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
            {!sheetDbUrl && <SetupSyncBanner onConfigure={() => setSettingsModalOpen(true)} />}

            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2">
                    <ViewTab label="Dashboard" isActive={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} iconPath="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
                    <ViewTab label="Raw Materials" isActive={currentView === 'inventory'} onClick={() => setCurrentView('inventory')} iconPath="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
                 </div>
                 <div className="flex items-center gap-2">
                    <button onClick={() => setAnalysisModalOpen(true)} className="secondary-btn">
                        <Icon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM18 13.5a3.375 3.375 0 00-3.375-3.375L13.5 9.75l-1.125.375a3.375 3.375 0 00-2.456 2.456L9 13.5l.375 1.125a3.375 3.375 0 002.456 2.456L13.5 18l1.125-.375a3.375 3.375 0 002.456-2.456L18 13.5z" className="w-5 h-5" />
                        AI Analysis
                    </button>
                    <button onClick={() => setIsChatModalOpen(true)} className="secondary-btn">
                         <Icon path="M8.625 12a.375.375 0 01.375-.375h6a.375.375 0 010 .75h-6a.375.375 0 01-.375-.375zm0 2.25a.375.375 0 01.375-.375h6a.375.375 0 010 .75h-6a.375.375 0 01-.375-.375zM3.375 7.5c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 013.75 3.75v1.875C9.375 13.964 8.536 14.812 7.5 14.812h-.375A3.75 3.75 0 013.375 11.062V7.5z" className="w-5 h-5" />
                         Chat Assistant
                    </button>
                    <button onClick={handleRefreshFromSheets} className="secondary-btn">
                        <Icon path="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-11.667-11.667l3.181 3.183A8.25 8.25 0 0118.015 19.644l3.181-3.183" className="w-5 h-5"/>
                        Refresh
                    </button>
                     <button onClick={() => setRecordSaleModalOpen(true)} className="primary-btn">
                        <Icon path="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.328 1.095-.824l1.923-6.118A.75.75 0 0018 9.375H5.625a.75.75 0 00-.741.838l.102 1.437M7.5 14.25L5.106 5.162A.75.75 0 004.368 4.5H2.25" className="w-5 h-5"/> Record Sale
                    </button>
                </div>
            </div>

            {currentView === 'dashboard' ? (
                <Dashboard items={items} theme={theme} lowStockThreshold={lowStockThreshold} onUpdateStock={handleOpenUpdateStockModal} onAddItem={() => handleOpenAddModal()} />
            ) : (
             <>
                 <div className="bg-white dark:bg-slate-900/50 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="relative w-full md:max-w-xs">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Icon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" className="w-5 h-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full rounded-md border-0 py-2 pl-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-amber-500"
                                    placeholder="Search raw materials..."
                                />
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button onClick={handleOpenAddModal} className="primary-btn w-full md:w-auto">
                                     <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-5 h-5"/> Add Raw Material
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-white sm:pl-6 cursor-pointer" onClick={() => handleSort('name')}>Name {renderSortArrow('name')}</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer" onClick={() => handleSort('category')}>Category {renderSortArrow('category')}</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer" onClick={() => handleSort('quantity')}>Quantity {renderSortArrow('quantity')}</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer" onClick={() => handleSort('price')}>Unit Price {renderSortArrow('price')}</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer" onClick={() => handleSort('value')}>Total Value {renderSortArrow('value')}</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer" onClick={() => handleSort('date')}>Date {renderSortArrow('date')}</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                {sortedItems.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                            <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                                            <div className="text-slate-500 font-mono text-xs">{item.sku}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{item.category}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{item.quantity}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{item.price ? `₹${item.price.toFixed(2)}` : 'N/A'}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{`₹${(item.quantity * (item.price || 0)).toFixed(2)}`}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{item.date}</td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                             <TableActions
                                                item={item}
                                                onUpdateStock={() => handleOpenUpdateStockModal(item)}
                                                onEdit={() => handleOpenEditModal(item)}
                                                onDelete={() => handleDeleteItem(item.id)}
                                             />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {sortedItems.length === 0 && (
                            <div className="text-center py-12 px-6">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">No Raw Materials Found</h3>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your search criteria did not match any items.</p>
                                <button onClick={() => { setSearchTerm(''); }} className="primary-btn mt-4">Clear Search</button>
                            </div>
                         )}
                    </div>
                 </div>
              </>
            )}
        </main>
      </div>

      <Modal isOpen={isAddEditModalOpen} onClose={handleCloseModals} title={selectedItem ? 'Edit Raw Material' : 'Add New Raw Material'}>
          <InventoryItemForm item={selectedItem} onSave={handleSaveItem} onClose={handleCloseModals} allItems={items} />
      </Modal>
      <UpdateStockModal item={selectedItem} isOpen={isUpdateStockModalOpen} onClose={() => setUpdateStockModalOpen(false)} onUpdate={handleUpdateStock} />
      <AnalysisModal isOpen={isAnalysisModalOpen} onClose={() => setAnalysisModalOpen(false)} rawMaterialApiUrl={rawMaterialSheetApiUrl} finishedGoodsApiUrl={finishedGoodsSheetApiUrl} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} onSave={handleSaveSettings} savedSettings={{ notificationEmail, lowStockThreshold, emailJsServiceId, emailJsTemplateId, emailJsPublicKey, sheetDbUrl }} />
      <RecordSaleModal 
        isOpen={isRecordSaleModalOpen}
        onClose={() => setRecordSaleModalOpen(false)}
        onConfirmSale={handleRecordSale}
        finishedGoodNames={getAllFinishedGoodNames()}
        getBomForProduct={getBomForProduct}
        rawMaterials={items}
      />
       <ChatModal items={items} isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} />
       <style>{`
          .primary-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background-color: #f59e0b; /* amber-500 */
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            font-weight: 500;
            transition: background-color 0.2s;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }
          .primary-btn:hover {
            background-color: #d97706; /* amber-600 */
          }
          .secondary-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background-color: white;
            color: #475569; /* slate-600 */
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            font-weight: 500;
            border: 1px solid #cbd5e1; /* slate-300 */
            transition: background-color 0.2s;
             box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }
          .dark .secondary-btn {
            background-color: #334155; /* slate-700 */
            color: #e2e8f0; /* slate-200 */
            border-color: #475569; /* slate-600 */
          }
          .secondary-btn:hover {
            background-color: #f8fafc; /* slate-50 */
          }
          .dark .secondary-btn:hover {
             background-color: #475569; /* slate-600 */
          }
          @keyframes fade-in {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
              animation: fade-in 0.5s ease-out forwards;
          }
       `}</style>
    </>
  );
}