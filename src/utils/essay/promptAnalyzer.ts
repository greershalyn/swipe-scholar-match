
import { PromptCategories } from "@/types/essay";

export const promptCategories: PromptCategories = {
  adversity: [
    "What is a challenge you've faced that changed your perspective on life?",
    "Describe a time when you had to overcome a significant obstacle. What did you learn?",
    "Tell me about a moment when you felt like giving up but persisted anyway.",
  ],
  leadership: [
    "Share an experience where you had to take initiative or lead others.",
    "Describe a situation where you influenced positive change in your community.",
    "Tell me about a time when you had to make a difficult decision that affected others.",
  ],
  passion: [
    "If your favorite hobby could teach a life lesson, what would it be?",
    "What drives you to pursue your chosen field of study?",
    "Describe a project or activity that makes you lose track of time.",
  ],
  impact: [
    "What's a tradition or routine in your life that holds special meaning to you?",
    "How do you hope to make a difference in your community or field?",
    "Describe a moment when you realized your potential to create change.",
  ],
  growth: [
    "Imagine you're writing a letter to your younger self—what advice would you give?",
    "How has your background shaped your goals and aspirations?",
    "Describe a moment that transformed your understanding of success.",
  ]
};

export function analyzeEssayTopic(topic: string): string {
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('challenge') || topicLower.includes('obstacle') || topicLower.includes('difficult')) {
    return promptCategories.adversity[0];
  }
  if (topicLower.includes('lead') || topicLower.includes('guide') || topicLower.includes('influence')) {
    return promptCategories.leadership[0];
  }
  if (topicLower.includes('passion') || topicLower.includes('interest') || topicLower.includes('career')) {
    return promptCategories.passion[0];
  }
  if (topicLower.includes('community') || topicLower.includes('impact') || topicLower.includes('change')) {
    return promptCategories.impact[0];
  }
  return promptCategories.growth[0];
}
