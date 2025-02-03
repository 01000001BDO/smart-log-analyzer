'use client';

import { useState } from 'react';
import { LogUploader } from '@/components/LogUploader';
import { LogViewer } from '@/components/LogViewer';
import { LogCharts } from '@/components/LogCharts';
import { FilterPanel } from '@/components/FilterPanel';
import { LogFilter, LogEntry } from '@/types/log';

export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogFilter>({});

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">Log Analyzer</h1>
      
      <div className="space-y-6">
        <LogUploader onUploadComplete={setLogs} />
        {logs.length > 0 && (
          <>
            <FilterPanel filter={filter} onChange={setFilter} />
            <LogCharts logs={logs} />
            <LogViewer 
              logs={logs}
              filter={filter}
              onFilterChange={setFilter}
            />
          </>
        )}
      </div>
    </main>
  );
}