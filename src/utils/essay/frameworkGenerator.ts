
import { supabase } from "@/integrations/supabase/client";
import { EssaySuggestion, ExpandedFramework } from "@/types/essay";

export async function generateExpandedFramework(
  suggestion: EssaySuggestion,
  essayTopic: string,
  personalResponse: string
): Promise<ExpandedFramework> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-expanded-framework', {
      body: {
        essayTopic,
        personalResponse,
        selectedApproach: suggestion
      }
    });

    if (error) {
      console.error('Error generating expanded framework:', error);
      throw error;
    }

    if (!data?.framework) {
      throw new Error('No framework data received');
    }

    // Parse the framework string if it's returned as a string
    const frameworkData = typeof data.framework === 'string' 
      ? JSON.parse(data.framework) 
      : data.framework;

    return frameworkData;
  } catch (error) {
    console.error('Error in generateExpandedFramework:', error);
    throw error;
  }
}
