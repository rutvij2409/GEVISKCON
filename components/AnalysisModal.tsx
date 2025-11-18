import React, { useState, useEffect } from 'react';
import { analyzeInventory } from '../services/geminiService';
import { fetchAllItemsFromSheets } from '../services/sheetService';
import { Loader } from './Loader';
import { Modal } from './Modal';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawMaterialApiUrl: string;
  finishedGoodsApiUrl: string;
}

// Simple markdown to HTML renderer
const renderMarkdown = (text: string) => {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\n/g, '<br />'); // Newlines

  return { __html: html };
};


export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, rawMaterialApiUrl, finishedGoodsApiUrl }) => {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (isOpen) {
      const performLiveAnalysis = async () => {
        setIsLoading(true);
        setAnalysis('');

        if (!rawMaterialApiUrl) {
          setAnalysis('Data source not configured. Please set your SheetDB API URL in Settings.');
          setIsLoading(false);
          return;
        }

        try {
          setStatus('Fetching latest data from Google Sheets...');
          const liveItems = await fetchAllItemsFromSheets(rawMaterialApiUrl, finishedGoodsApiUrl);

          if (!liveItems || liveItems.length === 0) {
            setAnalysis('No inventory data found in your Google Sheets to analyze.');
            setIsLoading(false);
            return;
          }

          setStatus('Analyzing your live inventory...');
          const result = await analyzeInventory(liveItems);
          setAnalysis(result);

        } catch (error) {
          console.error('Failed to perform live analysis:', error);
          setAnalysis('Failed to fetch or analyze live data. Please check your SheetDB URL, internet connection, and ensure the sheet is configured correctly.');
        } finally {
          setIsLoading(false);
          setStatus('');
        }
      };

      performLiveAnalysis();
    }
  }, [isOpen, rawMaterialApiUrl, finishedGoodsApiUrl]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Inventory Analysis">
      {isLoading ? (
        <div className="text-center">
            <Loader />
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{status}</p>
        </div>
      ) : (
        <div
          className="prose prose-slate dark:prose-invert max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-strong:text-slate-800 dark:prose-strong:text-slate-100"
          dangerouslySetInnerHTML={renderMarkdown(analysis)}
        />
      )}
    </Modal>
  );
};
