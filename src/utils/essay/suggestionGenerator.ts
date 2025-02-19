
import { supabase } from "@/integrations/supabase/client";
import { EssaySuggestion } from "@/types/essay";

export async function generateEssaySuggestions(essayTopic: string, response: string): Promise<EssaySuggestion[]> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-essay-content', {
      body: { essayTopic, personalResponse: response },
    });

    if (error) throw error;

    const aiSuggestion = JSON.parse(data.suggestion);
    
    // Create three variations of the AI-generated framework
    return [
      {
        title: aiSuggestion.title,
        hook: aiSuggestion.hook,
        framework: "Primary approach: " + aiSuggestion.talkingPoints[0].theme
      },
      {
        title: aiSuggestion.title + ": An Alternative Perspective",
        hook: aiSuggestion.talkingPoints[1].content,
        framework: "Alternative approach: " + aiSuggestion.talkingPoints[1].theme
      },
      {
        title: "Beyond " + aiSuggestion.title,
        hook: aiSuggestion.talkingPoints[2].content,
        framework: "Innovative approach: " + aiSuggestion.talkingPoints[2].theme
      }
    ];
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    // Fallback to static suggestions if AI fails
    return generateStaticSuggestions(essayTopic, response);
  }
}

// Fallback function with the original static suggestions
function generateStaticSuggestions(essayTopic: string, response: string): EssaySuggestion[] {
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
}
