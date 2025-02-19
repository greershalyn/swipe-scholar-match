
import { supabase } from "@/integrations/supabase/client";
import { EssaySuggestion, ExpandedFramework } from "@/types/essay";

export async function generateExpandedFramework(
  suggestion: EssaySuggestion,
  essayTopic: string,
  personalResponse: string
): Promise<ExpandedFramework> {
  try {
    console.log('Generating framework with:', {
      suggestion,
      essayTopic,
      personalResponse
    });

    const { data, error } = await supabase.functions.invoke('generate-expanded-framework', {
      body: {
        essayTopic,
        personalResponse,
        selectedApproach: suggestion
      }
    });

    console.log('Function response:', { data, error });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    if (!data?.framework) {
      console.error('No framework data in response:', data);
      throw new Error('No framework data received');
    }

    // Parse the framework if it's a string
    const frameworkData = typeof data.framework === 'string' 
      ? JSON.parse(data.framework) 
      : data.framework;

    console.log('Parsed framework data:', frameworkData);

    // Validate framework structure
    if (!frameworkData.title || !frameworkData.hook || 
        !Array.isArray(frameworkData.talkingPoints) || !frameworkData.conclusion) {
      throw new Error('Invalid framework structure received');
    }

    return frameworkData;
  } catch (error) {
    console.error('Error in generateExpandedFramework:', error);
    throw error;
  }
}
