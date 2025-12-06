
import React, { useRef, useState } from 'react';
import { Upload, FileText, Loader2, AlertCircle, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { processCsvData } from '../services/analyticsService';
import { AnalyticsResult, AppConfig } from '../types';
import { DEFAULT_CONFIG } from '../constants';

interface FileUploadProps {
  onDataProcessed: (data: AnalyticsResult) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataProcessed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const processFile = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      if (!file.name.endsWith('.csv')) {
        throw new Error("Please upload a CSV file");
      }
      // Pass the current config state to the processor
      const data = await processCsvData(file, config);
      onDataProcessed(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process file");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleConfigChange = (key: keyof AppConfig, value: string) => {
    const numValue = parseFloat(value);
    setConfig(prev => ({
      ...prev,
      [key]: isNaN(numValue) ? 0 : numValue
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 space-y-8">
      
      {/* Configuration Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-200 text-left"
        >
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Analysis Configuration</span>
          </div>
          {showConfig ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>
        
        {showConfig && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Budget ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={config.monthly_budget}
                  onChange={(e) => handleConfigChange('monthly_budget', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Cost / Message</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                <input 
                  type="number" 
                  step="0.0001"
                  value={config.target_cost_per_message}
                  onChange={(e) => handleConfigChange('target_cost_per_message', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

             <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Cost / Chat</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                <input 
                  type="number" 
                  step="0.0001"
                  value={config.target_cost_per_chat}
                  onChange={(e) => handleConfigChange('target_cost_per_chat', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Exp. Daily Messages</label>
              <input 
                type="number" 
                value={config.expected_daily_messages}
                onChange={(e) => handleConfigChange('expected_daily_messages', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Msgs Per Chat</label>
              <input 
                type="number" 
                value={config.average_messages_per_chat}
                onChange={(e) => handleConfigChange('average_messages_per_chat', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

             <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Large Req Threshold (Tokens)</label>
              <input 
                type="number" 
                value={config.large_request_threshold}
                onChange={(e) => handleConfigChange('large_request_threshold', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

          </div>
        )}
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
          ${isDragging 
            ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }
          ${loading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleChange}
        />
        
        <div className="flex flex-col items-center gap-4">
          {loading ? (
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          ) : (
            <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-slate-100'}`}>
              <Upload className={`w-10 h-10 ${isDragging ? 'text-blue-600' : 'text-slate-400'}`} />
            </div>
          )}
          
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-slate-700">
              {loading ? 'Processing Data...' : 'Upload Analytics CSV'}
            </h3>
            <p className="text-slate-500">
              Drag & drop your file here, or click to browse
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex justify-center gap-8 text-sm text-slate-400">
        <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Supported: standard CSV</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200 animate-pulse"></div>
            <span>Local Processing Only</span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
