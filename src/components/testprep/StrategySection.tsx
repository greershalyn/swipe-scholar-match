
import React from 'react';

type StrategyItem = {
  text: string;
};

type StrategySectionProps = {
  title: string;
  description: string;
  strategies: StrategyItem[];
  className?: string;
};

const StrategySection = ({ title, description, strategies, className = "" }: StrategySectionProps) => {
  return (
    <div className={`bg-purple-100 p-4 rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p>{description}</p>
      <ul className="list-disc list-inside mt-2 text-gray-700">
        {strategies.map((strategy, index) => (
          <li key={index}>{strategy.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default StrategySection;
