import React, { useRef, useState } from 'react';
import {
  Database,
  Download,
  Upload,
  Trash2,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  FileJson,
  CheckCircle2,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { formatNumber } from '../../utils/currency';

export function SettingsView() {
  const {
    users,
    storageInfo,
    exportBackup,
    importBackup,
    clearAllApplicationData,
    loadSampleDataset,
    addToast,
  } = usePortfolio();

  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file) => {
    if (!file) return;

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      addToast({
        type: 'error',
        title: 'Invalid File',
        message: 'Please select a valid .json backup file.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      importBackup(content);
    };
    reader.onerror = () => {
      addToast({
        type: 'error',
        title: 'Read Error',
        message: 'Failed to read the selected file.',
      });
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Data Management & Storage
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Browser LocalStorage persistence, backup export, and system configuration
        </p>
      </div>

      {/* Storage Status & Telemetry Card */}
      <div className="fintech-card p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#1E293B]">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Storage Engine Status
            </h3>
            <p className="text-xs text-slate-400">
              Browser-native LocalStorage layer
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-800/40 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {storageInfo.isAvailable ? 'Storage Active & Healthy' : 'Storage Unavailable'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-3 bg-[#0B0F19] border border-[#1E293B] rounded-xl">
            <span className="text-slate-500 block text-[11px] uppercase font-sans">Storage Key</span>
            <span className="text-slate-200 font-bold mt-1 block truncate">
              {storageInfo.storageKey}
            </span>
          </div>

          <div className="p-3 bg-[#0B0F19] border border-[#1E293B] rounded-xl">
            <span className="text-slate-500 block text-[11px] uppercase font-sans">Data Size</span>
            <span className="text-emerald-400 font-bold mt-1 block">
              {storageInfo.formattedSize}
            </span>
          </div>

          <div className="p-3 bg-[#0B0F19] border border-[#1E293B] rounded-xl">
            <span className="text-slate-500 block text-[11px] uppercase font-sans">Users Stored</span>
            <span className="text-cyan-400 font-bold mt-1 block">
              {storageInfo.usersCount} Profiles
            </span>
          </div>

          <div className="p-3 bg-[#0B0F19] border border-[#1E293B] rounded-xl">
            <span className="text-slate-500 block text-[11px] uppercase font-sans">Holdings Stored</span>
            <span className="text-amber-400 font-bold mt-1 block">
              {storageInfo.holdingsCount} Positions
            </span>
          </div>
        </div>

        {/* LocalStorage Technical Explanation & Disclosure */}
        <div className="mt-4 p-3.5 bg-[#0B0F19]/80 border border-[#1E293B] rounded-xl text-xs text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Client-Side Isolation Notice</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            All user profiles and investment holdings are stored directly in your browser's local sandbox ({storageInfo.storageKey}). Data persists indefinitely across page reloads and browser restarts. However, because this is client-side storage, it is specific to this browser and profile and does not synchronize with external servers or separate devices. Use the JSON backup tools below to transfer data between environments.
          </p>
        </div>
      </div>

      {/* Backup Export and Import */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="fintech-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Export JSON Backup</h3>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Export all registered users, linked holdings, weighted average prices, and system metadata into a structured JSON file.
            </p>
          </div>

          <div className="pt-4 border-t border-[#1E293B]">
            <button
              onClick={exportBackup}
              disabled={users.length === 0}
              className="w-full fintech-btn-primary !py-2.5"
            >
              <Download className="w-4 h-4 text-slate-950" />
              Download Backup ({users.length} Users)
            </button>
          </div>
        </div>

        {/* Import Card */}
        <div className="fintech-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Import JSON Backup</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Restore a previously exported backup file. Deep schema validation ensures data integrity before any updates are committed.
            </p>

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-950/20'
                  : 'border-[#273549] hover:border-slate-500 bg-[#0B0F19]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              <FileJson className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <span className="text-xs font-semibold text-slate-300 block">
                Click to browse or drag & drop JSON file
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Supported format: .json
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Reset & Sample Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sample Dataset */}
        <div className="fintech-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Load Sample Portfolio</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Instantly populate the system with 3 realistic investor profiles (Virat Kumar, Priya Sharma, Arjun Patel) and diversified Indian blue-chip stock portfolios (Reliance, TCS, HDFC Bank, Infosys, Tata Motors, ITC, etc.).
            </p>
          </div>

          <div className="pt-4 border-t border-[#1E293B]">
            <button
              onClick={loadSampleDataset}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              Load Realistic Indian Portfolio Dataset
            </button>
          </div>
        </div>

        {/* Clear All Data */}
        <div className="fintech-card p-5 sm:p-6 border-rose-950/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-bold text-white">Reset Application</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Permanently wipe all users, portfolios, and holdings from browser localStorage. Recommended if you wish to start from an empty slate.
            </p>
          </div>

          <div className="pt-4 border-t border-[#1E293B]">
            <button
              onClick={clearAllApplicationData}
              disabled={users.length === 0}
              className="w-full fintech-btn-danger !py-2.5 !text-xs"
            >
              <Trash2 className="w-4 h-4" />
              Reset All Application Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
