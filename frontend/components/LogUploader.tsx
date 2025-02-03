import { useState } from 'react';
import { Upload } from 'lucide-react';
import { LogEntry } from '@/types/log';

interface Props {
  onUploadComplete: (logs: LogEntry[]) => void;
}

export const LogUploader: React.FC<Props> = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);

  const parseLogLine = (line: string): LogEntry | null => {
    const regex = /(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s\[(\w+)\]\s(.+)/;
    const match = line.match(regex);
    if (match) {
      return {
        timestamp: new Date(match[1]).toISOString(),
        level: match[2] as LogEntry['level'],
        message: match[3],
        metadata: null as Record<string, unknown> | null
      };
    }
    return null;
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const logs = lines.map(parseLogLine).filter((log): log is LogEntry => log !== null);

    try {
      const response = await fetch('http://localhost:8080/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logs)
      });

      const data = await response.json();
      onUploadComplete(logs);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
      <input
        type="file"
        onChange={handleUpload}
        accept=".log,.txt"
        className="hidden"
        id="log-upload"
      />
      <label 
        htmlFor="log-upload"
        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <Upload className="w-8 h-8 mb-2 text-gray-500" />
        <span className="text-sm text-gray-500">
          Drop log file here or click to browse
        </span>
      </label>

      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
};