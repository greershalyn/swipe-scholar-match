
import { EssaySuggestion, ExpandedFramework } from "@/types/essay";
import { extractThemes } from "./themeExtractor";
import { supabase } from "@/integrations/supabase/client";

function generatePersonalizedHook(response: string, defaultHook: string): string {
  const firstSentence = response.split('.')[0];
  if (firstSentence && firstSentence.length > 20) {
    return `"${firstSentence.trim()}." This moment marked the beginning of a journey that would shape my future.`;
  }
  return defaultHook;
}

export async function generateExpandedFramework(
  suggestion: EssaySuggestion,
  topic: string,
  response: string
): Promise<ExpandedFramework> {
  try {
    // Call the Edge Function to get AI-generated framework
    const { data, error } = await supabase.functions.invoke('generate-expanded-framework', {
      body: { 
        essayTopic: topic, 
        personalResponse: response,
        selectedApproach: suggestion.title
      },
    });

    if (error) throw error;

    const aiFramework = JSON.parse(data.framework);
    return {
      title: aiFramework.title,
      hook: aiFramework.hook,
      talkingPoints: aiFramework.talkingPoints.map(point => ({
        title: point.title,
        points: point.points
      })),
      conclusion: aiFramework.conclusion
    };
  } catch (error) {
    console.error('Error generating expanded framework:', error);
    // Fallback to static framework generation
    const userThemes = extractThemes(response);
    const personalizedHook = generatePersonalizedHook(response, suggestion.hook);
    
    // Return fallback framework based on topic type
    const topicLower = topic.toLowerCase();
    if (topicLower.includes('lead') || topicLower.includes('influence')) {
      return generateLeadershipFramework(suggestion, userThemes, personalizedHook);
    } else if (topicLower.includes('challenge') || topicLower.includes('obstacle')) {
      return generateAdversityFramework(suggestion, userThemes, personalizedHook);
    } else if (topicLower.includes('passion') || topicLower.includes('interest')) {
      return generatePassionFramework(suggestion, userThemes, personalizedHook);
    } else {
      return generateGeneralFramework(suggestion, userThemes, personalizedHook);
    }
  }
}

function generateLeadershipFramework(suggestion: EssaySuggestion, userThemes: any, personalizedHook: string): ExpandedFramework {
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
}

function generateAdversityFramework(suggestion: EssaySuggestion, userThemes: any, personalizedHook: string): ExpandedFramework {
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
}

function generatePassionFramework(suggestion: EssaySuggestion, userThemes: any, personalizedHook: string): ExpandedFramework {
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
}

function generateGeneralFramework(suggestion: EssaySuggestion, userThemes: any, personalizedHook: string): ExpandedFramework {
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
