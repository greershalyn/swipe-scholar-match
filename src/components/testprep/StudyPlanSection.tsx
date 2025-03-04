
import React from 'react';

type StudyPlan = {
  text: string;
};

type StudyPlanSectionProps = {
  title: string;
  description: string;
  plans: StudyPlan[];
  className?: string;
};

const StudyPlanSection = ({ title, description, plans, className = "" }: StudyPlanSectionProps) => {
  return (
    <div className={`border p-4 rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p>{description}</p>
      <ul className="list-disc list-inside mt-2 text-gray-700">
        {plans.map((plan, index) => (
          <li key={index}>{plan.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default StudyPlanSection;
