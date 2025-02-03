import { useState, useEffect } from 'react';
import { LogEntry, LogFilter, LogAnalysis } from '@/types/log';
import { LogTable } from './LogTable';
import { LogCharts } from './LogCharts';
import { PatternList } from './PatternList';
import { AnomalyList } from './AnomalyList';
import {AIAnalysis} from "./AIanalyse";

interface Props {
  logs: LogEntry[];
  filter: LogFilter;
  onFilterChange: (filter: LogFilter) => void;
}

export const LogViewer: React.FC<Props> = ({ logs, filter, onFilterChange }) => {
  const [analysis, setAnalysis] = useState<LogAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (logs && logs.length > 0) {
      setLoading(true);
      setError(null);
      fetch('http://localhost:8080/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logs)
      })
      .then(res => res.json())
      .then(data => setAnalysis(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
    }
  }, [logs]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="lg:col-span-2">
          <LogTable logs={logs} filter={filter} />
        </div>
        {analysis && (
          <>
            <div className="lg:col-span-2">
              <LogCharts analysis={analysis} />
            </div>
            <PatternList patterns={analysis.patterns} />
            <AnomalyList anomalies={analysis.anomalies} />
            <div className='lg:col-span-2'>
              <AIAnalysis logs={logs} />
            </div>
          </>
        )}
      </div>
      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}
      {error && (
        <div className="text-red-500 text-center">{error}</div>
      )}
    </div>
  );
};