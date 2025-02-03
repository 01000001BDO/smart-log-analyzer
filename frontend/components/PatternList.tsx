import { Pattern } from '@/types/log';

interface Props {
  patterns: Pattern[];
}

export const PatternList: React.FC<Props> = ({ patterns }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Detected Patterns</h3>
      <div className="space-y-4">
        {patterns.map((pattern, index) => (
          <div key={index} className="border-b dark:border-gray-700 pb-4">
            <div className="flex justify-between items-start">
              <span className="font-medium">{pattern.pattern}</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {pattern.occurrences} occurrences
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {pattern.examples.map((example, i) => (
                <div key={i} className="text-sm text-gray-600 dark:text-gray-400">
                  {example}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};