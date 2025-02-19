
import { PromptCategories, EssaySuggestion } from "@/types/essay";

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

export const analyzeEssayTopic = (topic: string): string => {
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
};

export const generateEssaySuggestions = (essayTopic: string, response: string): EssaySuggestion[] => {
  const topicLower = essayTopic.toLowerCase();
  
  if (topicLower.includes('challenge') || topicLower.includes('obstacle') || topicLower.includes('difficult')) {
    return [
      {
        title: "Turning Obstacles into Opportunities",
        hook: `"${response.slice(0, 50)}..." This moment wasn't just a challenge - it was a turning point.`,
        framework: "Show how this specific challenge revealed your strength, resilience, and ability to adapt. Connect these qualities to your future goals."
      },
      {
        title: "The Power of Perspective",
        hook: "Sometimes the biggest obstacles reveal our greatest potential.",
        framework: "Demonstrate how your experience changed your perspective and equipped you with unique problem-solving abilities."
      },
      {
        title: "From Setback to Comeback",
        hook: "What seemed like a roadblock became my launching pad.",
        framework: "Illustrate how overcoming this challenge taught you valuable lessons that will benefit your academic and professional journey."
      }
    ];
  } else if (topicLower.includes('lead') || topicLower.includes('influence')) {
    return [
      {
        title: "Leadership Through Action",
        hook: `When ${response.slice(0, 40)}... I discovered that leadership isn't about titles - it's about impact.`,
        framework: "Explore how your experience demonstrates authentic leadership through initiative and positive influence."
      },
      {
        title: "Building Bridges, Creating Change",
        hook: "True leadership begins with understanding others' needs.",
        framework: "Show how your leadership style focuses on bringing people together and creating meaningful change."
      },
      {
        title: "The Ripple Effect of Leadership",
        hook: "One small action can create waves of change.",
        framework: "Describe how your leadership experience created a lasting impact that extended beyond the initial situation."
      }
    ];
  } else if (topicLower.includes('passion') || topicLower.includes('interest')) {
    return [
      {
        title: "Where Passion Meets Purpose",
        hook: `My journey with ${response.slice(0, 30)} isn't just about personal interest - it's about creating impact.`,
        framework: "Connect your passion to broader goals and show how it drives your academic and professional aspirations."
      },
      {
        title: "The Journey of Discovery",
        hook: "Some passions are born; others are discovered through experience.",
        framework: "Illustrate how your passion evolved and shaped your perspective on your future career and goals."
      },
      {
        title: "From Interest to Innovation",
        hook: "What started as curiosity transformed into a calling.",
        framework: "Demonstrate how your passion has equipped you with unique skills and insights for your chosen field."
      }
    ];
  } else {
    return [
      {
        title: "A Personal Journey of Growth",
        hook: `"${response.slice(0, 50)}..." This experience shaped not just what I do, but who I am.`,
        framework: "Connect your personal story to larger themes of growth, learning, and future impact."
      },
      {
        title: "Breaking New Ground",
        hook: "Every experience, whether big or small, has the potential to create lasting change.",
        framework: "Show how your unique perspective and experiences position you to make meaningful contributions."
      },
      {
        title: "The Power of Personal Experience",
        hook: "Sometimes life's most important lessons come from unexpected places.",
        framework: "Illustrate how your personal journey has prepared you for future challenges and opportunities."
      }
    ];
  }
};
