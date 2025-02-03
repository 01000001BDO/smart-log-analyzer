import { LogEntry, LogFilter } from '@/types/log';
import { useMemo } from 'react';

interface Props {
  logs: LogEntry[];
  filter: LogFilter;
}

export const LogTable: React.FC<Props> = ({ logs, filter }) => {
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesLevel = !filter.level?.length || filter.level.includes(log.level);
      const matchesKeyword = !filter.keyword || log.message.toLowerCase().includes(filter.keyword.toLowerCase());
      const matchesDate = (!filter.startDate || new Date(log.timestamp) >= filter.startDate) && (!filter.endDate || new Date(log.timestamp) <= filter.endDate);
      return matchesLevel && matchesKeyword && matchesDate;
    });
  }, [logs, filter]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
        <thead>
          <tr className="border-b dark:border-gray-700">
            <th className="p-3 text-left">Timestamp</th>
            <th className="p-3 text-left">Level</th>
            <th className="p-3 text-left">Message</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log, index) => (
            <tr key={index} className="border-b dark:border-gray-700">
              <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                  log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {log.level}
                </span>
              </td>
              <td className="p-3">{log.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};