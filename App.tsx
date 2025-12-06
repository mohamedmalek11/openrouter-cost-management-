import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { AnalyticsResult } from './types';
import { Bot, LineChart } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<AnalyticsResult | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Navigation / Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-slate-900">RetroBot Analytics</h1>
              <span className="text-xs text-slate-500 font-medium tracking-wide">COST INTELLIGENCE SYSTEM</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="hidden md:flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              <span>v2.0 Web Edition</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!data ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10 mt-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Upload Usage Data</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Upload your chatbot's CSV export to generate a comprehensive financial report, 
                analyze token usage, and detect budget anomalies instantly.
              </p>
            </div>
            <FileUpload onDataProcessed={setData} />
            
            {/* Feature Highlights (Empty State) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
              {[
                { title: "Financial Projections", desc: "Calculate daily, monthly, and yearly cost estimates based on usage patterns." },
                { title: "Anomaly Detection", desc: "Automatically flag expensive messages, loops, and large context windows." },
                { title: "Private & Secure", desc: "Data is processed locally in your browser. No files are uploaded to any server." }
              ].map((f, i) => (
                <div key={i} className="text-center p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Dashboard data={data} onReset={() => setData(null)} />
        )}
      </main>

    </div>
  );
};

export default App;