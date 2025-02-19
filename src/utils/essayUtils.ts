
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

  // Extract key themes from user's response
  const userThemes = extractThemes(response);
  const personalizedHook = generatePersonalizedHook(response, suggestion.hook);

  if (isLeadershipPrompt) {
    return {
      title: suggestion.title,
      hook: personalizedHook,
      talkingPoints: [
        {
          title: "Vision Through Personal Experience",
          points: [
            `Describe how ${userThemes.context} led you to identify the need for leadership`,
            `Share specific moments where you had to step up, like when ${userThemes.keyMoment}`,
            "Connect your unique perspective to how you approached leadership differently"
          ]
        },
        {
          title: "Transforming Challenges into Opportunities",
          points: [
            `Detail how you overcame specific obstacles, such as ${userThemes.challenge}`,
            "Explain the strategies you developed to inspire and unite others",
            `Show how your experience with ${userThemes.skill} helped you succeed`
          ]
        },
        {
          title: "Creating Lasting Impact",
          points: [
            `Highlight the tangible results of your leadership, particularly ${userThemes.achievement}`,
            "Share specific feedback or changes you observed in your community",
            "Describe how this experience shaped your leadership philosophy"
          ]
        }
      ],
      conclusion: `Your journey of ${userThemes.growth} has equipped you with unique insights that will enrich your college experience and future career in ${userThemes.aspiration}. Your leadership style, developed through real-world challenges, will continue to create positive change in your academic and professional communities.`
    };
  } else if (isAdversityPrompt) {
    return {
      title: suggestion.title,
      hook: personalizedHook,
      talkingPoints: [
        {
          title: "Facing the Unexpected",
          points: [
            `Describe the specific moment when ${userThemes.challenge} became your reality`,
            `Share the emotional impact of ${userThemes.context} on your perspective`,
            "Detail your initial response and the support systems you discovered"
          ]
        },
        {
          title: "Finding Inner Strength",
          points: [
            `Explain how you developed ${userThemes.skill} to overcome this challenge`,
            `Share a specific example of when you had to ${userThemes.action}`,
            "Describe the moment you realized you were growing stronger"
          ]
        },
        {
          title: "Transformation Through Adversity",
          points: [
            `Detail how this experience changed your approach to ${userThemes.growth}`,
            `Explain how overcoming ${userThemes.challenge} prepared you for future challenges`,
            "Share the lessons that will guide your college journey"
          ]
        }
      ],
      conclusion: `The adversity you faced with ${userThemes.context} has shaped you into someone who not only perseveres but thrives in challenging situations. These experiences will be invaluable as you pursue your goals in ${userThemes.aspiration} and contribute to your college community.`
    };
  } else if (isPassionPrompt) {
    return {
      title: suggestion.title,
      hook: personalizedHook,
      talkingPoints: [
        {
          title: "The Spark of Discovery",
          points: [
            `Share the moment when ${userThemes.keyMoment} ignited your passion`,
            `Describe how ${userThemes.context} shaped your initial interest`,
            "Detail the early steps you took to explore this passion"
          ]
        },
        {
          title: "Growing Through Experience",
          points: [
            `Explain how you developed ${userThemes.skill} through your dedication`,
            `Share specific projects or initiatives, like ${userThemes.achievement}`,
            "Describe how your passion has evolved and deepened over time"
          ]
        },
        {
          title: "Creating Impact Through Passion",
          points: [
            `Detail how your work in ${userThemes.context} benefits others`,
            "Share specific examples of positive change you've created",
            `Explain how this passion connects to ${userThemes.aspiration}`
          ]
        }
      ],
      conclusion: `Your passion for ${userThemes.context} has not only shaped your personal growth but has prepared you to make meaningful contributions in ${userThemes.aspiration}. This dedication will continue to drive your success in college and beyond.`
    };
  } else {
    return {
      title: suggestion.title,
      hook: personalizedHook,
      talkingPoints: [
        {
          title: "A Journey of Personal Growth",
          points: [
            `Share how ${userThemes.context} became a defining part of your story`,
            `Describe the significance of ${userThemes.keyMoment}`,
            "Detail how this experience shaped your values and perspective"
          ]
        },
        {
          title: "Lessons Through Experience",
          points: [
            `Explain how you developed ${userThemes.skill} through this journey`,
            `Share specific examples of growth, like ${userThemes.achievement}`,
            "Describe how these experiences changed your approach to challenges"
          ]
        },
        {
          title: "Looking Forward",
          points: [
            `Connect your experience with ${userThemes.context} to your college goals`,
            `Detail how ${userThemes.growth} will help you succeed academically`,
            `Share your vision for impacting ${userThemes.aspiration}`
          ]
        }
      ],
      conclusion: `Your experiences with ${userThemes.context} have equipped you with unique perspectives and skills that will enrich your college journey and future career in ${userThemes.aspiration}. Your story demonstrates the kind of student who will make meaningful contributions to campus life and beyond.`
    };
  }
};

interface ExtractedThemes {
  context: string;
  keyMoment: string;
  challenge: string;
  skill: string;
  action: string;
  achievement: string;
  growth: string;
  aspiration: string;
}

function extractThemes(response: string): ExtractedThemes {
  // Extract key phrases and themes from the user's response
  const words = response.toLowerCase().split(' ');
  const context = extractMeaningfulPhrase(response, 0);
  const keyMoment = extractMeaningfulPhrase(response, 1);
  const challenge = findChallengePhrase(response);
  const skill = findSkillPhrase(response);
  const action = findActionPhrase(response);
  const achievement = findAchievementPhrase(response);
  const growth = findGrowthPhrase(response);
  const aspiration = findAspirationPhrase(response);

  return {
    context,
    keyMoment,
    challenge,
    skill,
    action,
    achievement,
    growth,
    aspiration
  };
}

function extractMeaningfulPhrase(text: string, startIndex: number): string {
  const sentences = text.split('.');
  return sentences[startIndex] ? sentences[startIndex].trim() : text.slice(0, 30).trim();
}

function findChallengePhrase(text: string): string {
  // Extract phrases related to challenges
  const challengeWords = ['challenge', 'difficult', 'struggle', 'obstacle'];
  return findPhraseContaining(text, challengeWords) || "this challenge";
}

function findSkillPhrase(text: string): string {
  // Extract phrases related to skills
  const skillWords = ['learned', 'developed', 'mastered', 'improved'];
  return findPhraseContaining(text, skillWords) || "these skills";
}

function findActionPhrase(text: string): string {
  // Extract phrases related to actions taken
  const actionWords = ['took', 'created', 'organized', 'started'];
  return findPhraseContaining(text, actionWords) || "take action";
}

function findAchievementPhrase(text: string): string {
  // Extract phrases related to achievements
  const achievementWords = ['accomplished', 'achieved', 'succeeded', 'completed'];
  return findPhraseContaining(text, achievementWords) || "your achievement";
}

function findGrowthPhrase(text: string): string {
  // Extract phrases related to personal growth
  const growthWords = ['grew', 'changed', 'evolved', 'developed'];
  return findPhraseContaining(text, growthWords) || "personal growth";
}

function findAspirationPhrase(text: string): string {
  // Extract phrases related to future aspirations
  const aspirationWords = ['hope', 'dream', 'goal', 'future'];
  return findPhraseContaining(text, aspirationWords) || "your chosen field";
}

function findPhraseContaining(text: string, keywords: string[]): string {
  const sentences = text.split('.');
  for (const sentence of sentences) {
    for (const keyword of keywords) {
      if (sentence.toLowerCase().includes(keyword)) {
        return sentence.trim();
      }
    }
  }
  return '';
}

function generatePersonalizedHook(response: string, defaultHook: string): string {
  const firstSentence = response.split('.')[0];
  if (firstSentence && firstSentence.length > 20) {
    return `"${firstSentence.trim()}." This moment marked the beginning of a journey that would shape my future.`;
  }
  return defaultHook;
}
