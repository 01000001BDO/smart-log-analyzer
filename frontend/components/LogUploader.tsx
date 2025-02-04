import { useState } from 'react';
import { Upload } from 'lucide-react';
import { LogEntry } from '@/types/log';

interface Props {
  onUploadComplete: (logs: LogEntry[]) => void;
}

export const LogUploader: React.FC<Props> = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const logs = lines
        .map(line => {
          const match = line.match(/\[(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\]\s(\w+):\s(.+)/);
          if (!match) {
            return null;
          }
          return {
            timestamp: new Date(match[1]).toISOString(),
            level: match[2] as LogEntry['level'],
            message: match[3],
            metadata: null
          };
        })
        .filter((log): log is LogEntry => log !== null);
      if (logs.length > 0) {
        onUploadComplete(logs);
      }
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div 
      className="border-2 border-dashed rounded-lg p-6 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
      onDrop={async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
          const input = document.createElement('input');
          input.type = 'file';
          input.files = e.dataTransfer.files;
          handleUpload({ target: input } as any);
        }
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        type="file"
        onChange={handleUpload}
        accept=".log,.txt"
        className="hidden"
        id="log-upload"
      />
      <label htmlFor="log-upload" className="flex flex-col items-center">
        <Upload className="w-8 h-8 mb-2 text-gray-500" />
        <span className="text-sm text-gray-500">
          Drop log file here or click to browse
        </span>
      </label>
      {uploading && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
};