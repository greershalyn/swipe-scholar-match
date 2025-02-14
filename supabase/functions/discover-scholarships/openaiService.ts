
import { UserProfile } from './types.ts';

export async function generateScholarships(openAiApiKey: string, userProfile: UserProfile) {
  const userProfilePrompt = buildUserProfilePrompt(userProfile);

  console.log('Generating scholarships with profile:', userProfilePrompt);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a scholarship database API. Always return a JSON object with a "scholarships" array containing exactly 10 scholarships.
            Each scholarship must include all required fields and be properly formatted.`
        },
        {
          role: 'user',
          content: `Generate 10 scholarships matching this student profile:
            ${userProfilePrompt}

            Return a JSON object with a "scholarships" array. Each scholarship must include:
            {
              "title": "string",
              "amount": number (no currency symbols or commas),
              "requirements": string[],
              "provider": "string",
              "description": "string",
              "category": "Local" | "State" | "Field-specific" | "Demographic" | "General"
            }`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const openAIData = await response.json();
  console.log('Raw OpenAI response:', JSON.stringify(openAIData, null, 2));

  if (!openAIData.choices?.[0]?.message?.content) {
    console.error('Invalid OpenAI response structure:', openAIData);
    throw new Error('No content in OpenAI response');
  }

  try {
    const parsedContent = JSON.parse(openAIData.choices[0].message.content);
    console.log('Parsed OpenAI content:', JSON.stringify(parsedContent, null, 2));

    if (!parsedContent.scholarships || !Array.isArray(parsedContent.scholarships)) {
      console.error('Invalid scholarships data structure:', parsedContent);
      throw new Error('Invalid scholarship data format from OpenAI');
    }

    return parsedContent;
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw new Error('Failed to parse OpenAI response');
  }
}

function buildUserProfilePrompt(userProfile: UserProfile): string {
  return `
    Location: ${userProfile.city || 'Any'}, ${userProfile.state || 'Any'}
    Education Level: ${userProfile.current_education_level || 'Any'}
    Major: ${userProfile.intended_major || 'Any'}
    GPA: ${userProfile.gpa || 'Any'}
    Ethnicity: ${userProfile.ethnicity || 'Any'}
    First Generation Student: ${userProfile.first_generation_student ? 'Yes' : 'No'}
    Keywords: ${(userProfile.keywords || []).join(', ') || 'None'}
    Extracurricular Activities: ${(userProfile.extracurricular_activities || []).join(', ') || 'None'}
    Organizations: ${(userProfile.organizations || []).join(', ') || 'None'}
  `;
}
