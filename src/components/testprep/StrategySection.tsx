
import React, { useState } from 'react';

type StrategyItem = {
  text: string;
  tips?: string[];
};

type StrategySectionProps = {
  title: string;
  description: string;
  strategies: StrategyItem[];
  className?: string;
};

const StrategySection = ({ title, description, strategies, className = "" }: StrategySectionProps) => {
  const [expandedStrategyIndex, setExpandedStrategyIndex] = useState<number | null>(null);

  const toggleStrategy = (index: number) => {
    setExpandedStrategyIndex(expandedStrategyIndex === index ? null : index);
  };

  return (
    <div className={`bg-purple-100 p-4 rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p>{description}</p>
      <ul className="mt-2 space-y-2">
        {strategies.map((strategy, index) => (
          <li key={index} className="text-gray-700">
            <div 
              className="flex items-start cursor-pointer hover:bg-purple-200 p-2 rounded-md transition-colors"
              onClick={() => toggleStrategy(index)}
            >
              <div className="flex-shrink-0 mt-1">
                {expandedStrategyIndex === index ? (
                  <svg className="w-4 h-4 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
              <span className="ml-2 font-medium">{strategy.text}</span>
            </div>
            
            {expandedStrategyIndex === index && strategy.tips && (
              <div className="mt-2 ml-6 bg-white p-3 rounded-md shadow-sm border border-purple-200">
                <ul className="list-disc list-inside space-y-1">
                  {strategy.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="text-sm text-gray-600">{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StrategySection;
