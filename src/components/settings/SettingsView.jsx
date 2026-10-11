import React, { useRef, useState } from 'react';
import {
  Database,
  Download,
  Upload,
  Trash2,
  HardDrive,
  ShieldCheck,
  FileJson,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export function SettingsView() {
  const {
    users,
    storageInfo,
    exportBackup,
    importBackup,
    clearAllApplicationData,
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
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Header */}
      <div>
        <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-purple-400 block mb-1">
          STORAGE CONTROLS
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Data Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Browser LocalStorage persistence, backup export, and JSON restoration
        </p>
      </div>

      {/* Storage Diagnostics Card */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Storage Engine Telemetry
            </h3>
            <p className="text-[11px] text-slate-400">
              Browser-isolated LocalStorage layer
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-white/[0.04] border border-white/10 text-purple-300">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              {storageInfo.isAvailable ? 'Active & Healthy' : 'Unavailable'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-3 bg-black/40 border border-white/[0.06] rounded-xl">
            <span className="text-slate-500 block text-[10px] uppercase font-sans">Storage Key</span>
            <span className="text-slate-200 font-bold mt-1 block truncate">
              {storageInfo.storageKey}
            </span>
          </div>

          <div className="p-3 bg-black/40 border border-white/[0.06] rounded-xl">
            <span className="text-slate-500 block text-[10px] uppercase font-sans">Storage Size</span>
            <span className="text-purple-300 font-bold mt-1 block">
              {storageInfo.formattedSize}
            </span>
          </div>

          <div className="p-3 bg-black/40 border border-white/[0.06] rounded-xl">
            <span className="text-slate-500 block text-[10px] uppercase font-sans">Registered Users</span>
            <span className="text-cyan-400 font-bold mt-1 block">
              {storageInfo.usersCount} Profiles
            </span>
          </div>

          <div className="p-3 bg-black/40 border border-white/[0.06] rounded-xl">
            <span className="text-slate-500 block text-[10px] uppercase font-sans">Stock Holdings</span>
            <span className="text-amber-400 font-bold mt-1 block">
              {storageInfo.holdingsCount} Positions
            </span>
          </div>
        </div>

        <div className="mt-4 p-3.5 bg-black/60 border border-white/[0.06] rounded-xl text-xs text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Client Isolation Policy</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            All user profiles and investment holdings reside strictly in your current browser session ({storageInfo.storageKey}). Data persists across page reloads and browser restarts. Because client-side storage does not synchronize across external machines, use the JSON export tools below to back up or transfer your portfolios.
          </p>
        </div>
      </div>

      {/* Backup Export and Import Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Export JSON Backup
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Export all genuine user-created profiles, holdings, and acquisition amounts into a portable JSON backup file.
            </p>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <button
              onClick={exportBackup}
              disabled={users.length === 0}
              className="w-full pill-btn-neon !text-xs !py-2.5"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup ({users.length} Users)</span>
            </button>
          </div>
        </div>

        {/* Import Card */}
        <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Import JSON Backup
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Restore a valid backup file. Strict schema validation ensures data integrity before applying changes.
            </p>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-purple-400 bg-purple-950/20'
                  : 'border-white/10 hover:border-purple-400/50 bg-black/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              <FileJson className="w-7 h-7 text-slate-500 mx-auto mb-2" />
              <span className="text-xs font-semibold text-slate-300 block">
                Click to browse or drop JSON backup
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Format: .json
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Application Card */}
      <div className="glass-card p-5 sm:p-6 border-rose-950/40">
        <div className="flex items-center gap-2 mb-2">
          <Trash2 className="w-5 h-5 text-rose-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Reset Application Data
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Permanently clear all user profiles and investment holdings from browser storage, returning the system to a clean empty state.
        </p>

        <div className="pt-4 border-t border-white/[0.06]">
          <button
            onClick={clearAllApplicationData}
            disabled={users.length === 0}
            className="pill-btn-secondary !text-rose-400 hover:!text-rose-200 !border-rose-800/40 hover:!bg-rose-950/40 !text-xs !py-2.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset All Application Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
