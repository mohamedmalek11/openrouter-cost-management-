import React, { useRef, useState } from 'react';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { processCsvData } from '../services/analyticsService';
import { AnalyticsResult } from '../types';

interface FileUploadProps {
  onDataProcessed: (data: AnalyticsResult) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataProcessed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      const data = await processCsvData(file);
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

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
          ${isDragging 
            ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' 
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
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="mt-8 flex justify-center gap-8 text-sm text-slate-400">
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