import React from 'react';
import { LogAnalysis } from '@/types/log';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  analysis: LogAnalysis;
}

export const LogCharts: React.FC<Props> = ({ analysis }) => {
  if (!analysis?.time_series || !analysis?.by_level) {
    return null;
  }

  const timeSeriesData = analysis.time_series.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    count: point.count,
    errors: point.error_count,
  }));

  const levelData = Object.entries(analysis.by_level).map(([level, count]) => ({
    level,
    count,
  }));

  return (
    <div className="grid grid-cols-1 gap-6 bg-white dark:bg-gray-800 p-4 rounded-lg">
      <div>
        <h3 className="text-lg font-semibold mb-4">Log Volume Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" name="Total Logs" />
              <Line type="monotone" dataKey="errors" stroke="#EF4444" name="Errors" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Distribution by Level</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={levelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex justify-between text-sm">
        <span>Total Entries: {analysis.total_entries}</span>
        <span>Error Rate: {(analysis.error_rate * 100).toFixed(2)}%</span>
        <span>Processing Time: {analysis.processing_time}</span>
      </div>
    </div>
  );
};