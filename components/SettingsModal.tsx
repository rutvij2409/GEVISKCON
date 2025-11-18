import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { useToast } from '../contexts/ToastContext';

export interface AppSettings {
  notificationEmail: string;
  lowStockThreshold: number;
  emailJsServiceId: string;
  emailJsTemplateId: string;
  emailJsPublicKey: string;
  sheetDbUrl: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSettings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, savedSettings, onSave }) => {
  const [settings, setSettings] = useState(savedSettings);
  const addToast = useToast();

  useEffect(() => {
    if (isOpen) {
      setSettings(savedSettings);
    }
  }, [savedSettings, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSave = () => {
    onSave(settings);
    addToast({ type: 'success', message: 'Settings saved successfully!' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
        
        {/* Section 1: Data Source */}
        <section>
             <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
                Data Source: Connect Google Sheets via SheetDB
            </h3>
            <p>
                Connect your inventory data using SheetDB. This creates a secure, read-write API endpoint that the app uses to fetch and save live data. Any changes you make here will instantly reflect in your sheet.
            </p>
            <details className="mt-2 text-xs cursor-pointer">
                <summary className="font-semibold text-slate-800 dark:text-slate-100">Show Setup Instructions</summary>
                 <div className="mt-2 space-y-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Go to <a href="https://sheetdb.io" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">SheetDB.io</a> and create a free account.</li>
                        <li>Click "Create API" and paste the URL of your Google Sheet.</li>
                        <li>
                            Your sheet MUST have two tabs (worksheets) named exactly: <strong className="text-slate-900 dark:text-slate-50">Raw Material</strong> and <strong className="text-slate-900 dark:text-slate-50">Finished Goods</strong>.
                        </li>
                         <li>
                            The column headers in your sheets (e.g., 'name', 'sku', 'quantity') must be on the first row and should not be changed.
                        </li>
                        <li>SheetDB will generate an API URL. Copy it and paste it into the "SheetDB API URL" field below.</li>
                    </ol>
                </div>
            </details>
             <div className="mt-4 grid grid-cols-1 gap-4">
                 <div>
                    <label htmlFor="sheetDbUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-200">SheetDB API URL</label>
                    <input type="text" id="sheetDbUrl" name="sheetDbUrl" value={settings.sheetDbUrl} onChange={handleChange} className="mt-1 block w-full common-input" placeholder="https://sheetdb.io/api/v1/..." />
                </div>
            </div>
            <p className="text-xs mt-2 text-slate-500 dark:text-slate-400">
                Note: This single URL will be used to access both the 'Raw Material' and 'Finished Goods' sheets by name.
            </p>
        </section>

        {/* Section 2: Email Notifications */}
        <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
                Low Stock Email Notifications
            </h3>
            <p>
                Get email alerts when stock is low. This uses the free tier of{' '}
                <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">
                EmailJS.com
                </a> to send emails securely from the browser.
            </p>
            <details className="mt-2 text-xs cursor-pointer">
                <summary className="font-semibold text-slate-800 dark:text-slate-100">Show Setup Instructions</summary>
                 <div className="mt-2 space-y-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Create a free account at <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">EmailJS.com</a>.</li>
                        <li>Click "Add New Service" and connect your email provider (e.g., Gmail). Copy the <strong className="text-slate-900 dark:text-slate-50">Service ID</strong>.</li>
                        <li>Go to "Email Templates" and "Create New Template".</li>
                        <li>Set the subject to: <code className="text-xs">Low Stock Alert: &#123;&#123;item_name&#125;&#125;</code></li>
                        <li>Paste the following into the template body, then save it. Copy the <strong className="text-slate-900 dark:text-slate-50">Template ID</strong>.
                            <div className="text-xs bg-slate-200 dark:bg-slate-700 p-2 rounded-md mt-1">
                                Hello,
                                <br /><br />
                                This is an automated alert that an item in your inventory is running low.
                                <br /><br />
                                Item: <strong>&#123;&#123;item_name&#125;&#125;</strong> (SKU: &#123;&#123;item_sku&#125;&#125;)<br />
                                New Quantity: <strong>&#123;&#123;new_quantity&#125;&#125;</strong><br />
                                Threshold: &#123;&#123;threshold&#125;&#125;
                                <br /><br />
                                Please reorder soon.
                            </div>
                        </li>
                        <li>On the Account page, copy your <strong className="text-slate-900 dark:text-slate-50">Public Key</strong>.</li>
                        <li>Fill in all the fields below.</li>
                    </ol>
                </div>
            </details>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="notificationEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Notification Email</label>
                    <input type="email" id="notificationEmail" name="notificationEmail" value={settings.notificationEmail} onChange={handleChange} className="mt-1 block w-full common-input" placeholder="you@example.com" />
                </div>
                <div>
                    <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Low Stock Threshold</label>
                    <input type="number" id="lowStockThreshold" name="lowStockThreshold" value={settings.lowStockThreshold} onChange={handleChange} className="mt-1 block w-full common-input" />
                </div>
                <div>
                    <label htmlFor="emailJsServiceId" className="block text-sm font-medium text-slate-700 dark:text-slate-200">EmailJS Service ID</label>
                    <input type="text" id="emailJsServiceId" name="emailJsServiceId" value={settings.emailJsServiceId} onChange={handleChange} className="mt-1 block w-full common-input" placeholder="service_..." />
                </div>
                <div>
                    <label htmlFor="emailJsTemplateId" className="block text-sm font-medium text-slate-700 dark:text-slate-200">EmailJS Template ID</label>
                    <input type="text" id="emailJsTemplateId" name="emailJsTemplateId" value={settings.emailJsTemplateId} onChange={handleChange} className="mt-1 block w-full common-input" placeholder="template_..." />
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="emailJsPublicKey" className="block text-sm font-medium text-slate-700 dark:text-slate-200">EmailJS Public Key</label>
                    <input type="text" id="emailJsPublicKey" name="emailJsPublicKey" value={settings.emailJsPublicKey} onChange={handleChange} className="mt-1 block w-full common-input" placeholder="YourPublicKey" />
                </div>
            </div>
        </section>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Save Settings
          </button>
        </div>
      </div>
      <style>{`.common-input { padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); } .dark .common-input { background-color: #1e293b; border-color: #475569; color: #e2e8f0; } .common-input::placeholder { color: #94a3b8; } .dark .common-input::placeholder { color: #64748b; } .common-input:focus { outline: none; box-shadow: 0 0 0 1px #f59e0b; border-color: #f59e0b; }`}</style>
    </Modal>
  );
};
