import { PromptCategories, EssaySuggestion, ExpandedFramework } from "@/types/essay";

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

export const generateExpandedFramework = (
  suggestion: EssaySuggestion,
  topic: string,
  response: string
): ExpandedFramework => {
  const topicLower = topic.toLowerCase();
  const isLeadershipPrompt = topicLower.includes('lead') || topicLower.includes('influence');
  const isAdversityPrompt = topicLower.includes('challenge') || topicLower.includes('obstacle');
  const isPassionPrompt = topicLower.includes('passion') || topicLower.includes('interest');

  if (isLeadershipPrompt) {
    return {
      title: suggestion.title,
      hook: suggestion.hook,
      talkingPoints: [
        {
          title: "Vision and Initiative",
          points: [
            "Describe how you identified the need for leadership in this situation",
            "Explain your approach to inspiring and motivating others",
            "Share specific examples of how you turned your vision into reality"
          ]
        },
        {
          title: "Building and Supporting Your Team",
          points: [
            "Discuss how you brought people together and fostered collaboration",
            "Share challenges in team management and how you overcame them",
            "Highlight specific strategies that proved successful"
          ]
        },
        {
          title: "Impact and Growth",
          points: [
            "Detail the measurable outcomes of your leadership",
            "Explain how this experience changed your leadership style",
            "Describe lessons learned that will shape your future approach"
          ]
        }
      ],
      conclusion: "Connect these leadership experiences to your academic goals and future career aspirations, showing how they've prepared you for greater challenges ahead."
    };
  } else if (isAdversityPrompt) {
    return {
      title: suggestion.title,
      hook: suggestion.hook,
      talkingPoints: [
        {
          title: "Understanding the Challenge",
          points: [
            "Describe the specific obstacles you faced and their impact",
            "Explain the broader context and why this challenge was significant",
            "Share your initial reactions and emotions"
          ]
        },
        {
          title: "Taking Action",
          points: [
            "Detail the specific steps you took to address the challenge",
            "Highlight the resources and support systems you utilized",
            "Explain your problem-solving process and decision-making"
          ]
        },
        {
          title: "Growth and Transformation",
          points: [
            "Share how this experience changed your perspective",
            "Describe the skills and strengths you developed",
            "Explain how these lessons apply to other areas of your life"
          ]
        }
      ],
      conclusion: "Demonstrate how overcoming this challenge has equipped you with valuable skills and perspectives that will contribute to your success in college and beyond."
    };
  } else if (isPassionPrompt) {
    return {
      title: suggestion.title,
      hook: suggestion.hook,
      talkingPoints: [
        {
          title: "Discovery and Development",
          points: [
            "Share the origin story of your passion",
            "Describe key moments that deepened your interest",
            "Explain how you've developed your expertise"
          ]
        },
        {
          title: "Impact and Innovation",
          points: [
            "Highlight specific projects or initiatives you've undertaken",
            "Describe how your passion benefits others",
            "Share unique perspectives you've gained"
          ]
        },
        {
          title: "Future Vision",
          points: [
            "Connect your passion to your chosen field of study",
            "Describe how you plan to expand your impact",
            "Share your long-term goals and aspirations"
          ]
        }
      ],
      conclusion: "Show how your passion has shaped your academic choices and career goals, demonstrating your commitment to continued growth and impact in your field."
    };
  } else {
    return {
      title: suggestion.title,
      hook: suggestion.hook,
      talkingPoints: [
        {
          title: "Personal Journey",
          points: [
            "Share the context and significance of your experience",
            "Describe key moments of learning or realization",
            "Explain how this experience shaped your values"
          ]
        },
        {
          title: "Skills and Growth",
          points: [
            "Detail specific abilities you've developed",
            "Highlight how you've applied these skills",
            "Share examples of personal growth"
          ]
        },
        {
          title: "Future Impact",
          points: [
            "Connect your experience to your academic interests",
            "Describe how you'll apply these lessons in college",
            "Share your vision for future contributions"
          ]
        }
      ],
      conclusion: "Demonstrate how this experience has prepared you for success in college and beyond, showing your readiness to make meaningful contributions to your chosen field."
    };
  }
};
