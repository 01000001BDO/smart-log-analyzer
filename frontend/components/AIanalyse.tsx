import { useState } from 'react';
import { LogEntry } from '@/types/log';

interface Props {
  logs: LogEntry[];
}

export const AIAnalysis: React.FC<Props> = ({ logs }) => {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getAIAnalysis = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8080/api/analyze/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logs)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      console.error('AI Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">AI Analysis</h3>
        <button 
          onClick={getAIAnalysis}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze with AI'}
        </button>
      </div>
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      {analysis && (
        <div className="prose dark:prose-invert whitespace-pre-wrap">
          {analysis}
        </div>
      )}
    </div>
  );
};