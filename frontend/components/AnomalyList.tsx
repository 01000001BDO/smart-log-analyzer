import { Anomaly } from '@/types/log';

interface Props {
  anomalies: Anomaly[];
}

export const AnomalyList: React.FC<Props> = ({ anomalies }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Detected Anomalies</h3>
      <div className="space-y-4">
        {anomalies.map((anomaly, index) => (
          <div key={index} className="flex items-center justify-between border-b dark:border-gray-700 pb-4">
            <div>
              <span className="text-red-500 font-medium">{anomaly.metric}</span>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(anomaly.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div>Value: {anomaly.value.toFixed(2)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Threshold: {anomaly.threshold.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};