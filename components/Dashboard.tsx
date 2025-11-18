import React, { useMemo } from 'react';
import { InventoryItem, ItemType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Icon } from './Icon';

interface DashboardProps {
  items: InventoryItem[];
  theme: 'light' | 'dark';
  lowStockThreshold: number;
  onUpdateStock: (item: InventoryItem) => void;
  onAddItem: (type: ItemType) => void;
}

const StatCard: React.FC<{ title: string; value: string; iconPath: string; iconClasses: string }> = ({ title, value, iconPath, iconClasses }) => (
  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex items-center gap-4">
    <div className={`p-3 rounded-full ${iconClasses}`}>
      <Icon path={iconPath} className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

export const Dashboard: React.FC<DashboardProps> = ({ items, theme, lowStockThreshold, onUpdateStock, onAddItem }) => {

  const stats = useMemo(() => {
    return items.reduce((acc, item) => {
      const value = item.quantity * (item.price || 0);
      acc.totalValue += value;
      acc.totalItems += 1;
      if (item.quantity <= lowStockThreshold && item.quantity > 0) {
        acc.lowStockItems += 1;
      }
      if (item.quantity === 0) {
        acc.outOfStockItems += 1;
      }
      return acc;
    }, { totalValue: 0, totalItems: 0, lowStockItems: 0, outOfStockItems: 0 });
  }, [items, lowStockThreshold]);

  const lowStockItems = useMemo(() => {
    return items
      .filter(item => item.quantity <= lowStockThreshold && item.quantity > 0)
      .sort((a, b) => a.quantity - b.quantity);
  }, [items, lowStockThreshold]);

  const categoryValueData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    items.forEach(item => {
      const value = item.quantity * (item.price || 0);
      const currentVal = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, currentVal + value);
    });
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7); // Show top 7 categories
  }, [items]);

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
    borderColor: theme === 'dark' ? '#475569' : '#e2e8f0',
    color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
    borderRadius: '0.5rem',
  };
  const legendColor = theme === 'dark' ? '#cbd5e1' : '#475569';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Raw Material Value"
          value={formatCurrency(stats.totalValue)}
          iconPath="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125-1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V6.375c0-.621.504-1.125 1.125-1.125h.375m16.5 3.375v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125-1.125h-.375m-1.5-1.5H21a.75.75 0 00-.75.75v.75M3.75 12h16.5m-16.5 0v3.75c0 .621.504 1.125 1.125 1.125h14.25c.621 0 1.125-.504 1.125-1.125V12"
          iconClasses="bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300"
        />
        <StatCard
          title="Unique Raw Materials"
          value={stats.totalItems.toLocaleString('en-IN')}
          iconPath="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
          iconClasses="bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-300"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems.toLocaleString('en-IN')}
          iconPath="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          iconClasses="bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300"
        />
        <StatCard
          title="Out of Stock Items"
          value={stats.outOfStockItems.toLocaleString('en-IN')}
          iconPath="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          iconClasses="bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Raw Materials Requiring Attention</h3>
          {lowStockItems.length > 0 ? (
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2 -mr-2">
              {lowStockItems.map(item => (
                <li key={item.id} className="flex items-center justify-between gap-4 p-2 rounded-md bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate" title={item.name}>{item.name}</p>
                    <p className="text-xs text-slate-500">Current stock: <span className="font-bold text-orange-500">{item.quantity}</span></p>
                  </div>
                  <button onClick={() => onUpdateStock(item)} className="secondary-btn !px-3 !py-1 text-xs">Update</button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <Icon path="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-8 h-8 text-green-500" />
              </div>
              <p className="mt-4 font-semibold text-slate-800 dark:text-slate-200">All Good!</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">No raw materials are below the low stock threshold.</p>
            </div>
          )}
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Raw Material Value by Category</h3>
          {categoryValueData.length > 0 ? (
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryValueData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {categoryValueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Legend iconSize={10} wrapperStyle={{ color: legendColor, fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <p className="font-semibold text-slate-800 dark:text-slate-200">No Data for Chart</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Add materials with price and quantity to see a breakdown.</p>
              <button onClick={() => onAddItem(ItemType.RAW_MATERIAL)} className="primary-btn mt-4">Add Your First Material</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
