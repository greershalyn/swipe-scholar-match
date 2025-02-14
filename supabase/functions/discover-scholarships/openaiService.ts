
import { UserProfile } from './types.ts';

export async function generateScholarships(openAiApiKey: string, userProfile: UserProfile) {
  const userProfilePrompt = buildUserProfilePrompt(userProfile);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a scholarship database API that specializes in finding local and matching scholarships based on student profiles.'
        },
        {
          role: 'user',
          content: `Generate 10 unique scholarships for a student with the following profile:
            ${userProfilePrompt}

            Priority order for scholarships:
            1. Local scholarships specific to ${userProfile.city}, ${userProfile.state}
            2. State-wide scholarships for ${userProfile.state}
            3. Field-specific scholarships for ${userProfile.intended_major}
            4. Demographic-specific scholarships based on profile
            5. General scholarships matching other criteria

            Each scholarship must include:
            - title (string)
            - amount (number, specific amount)
            - requirements (array of specific criteria)
            - provider (string, real organization name)
            - description (detailed string mentioning location if local)
            - category (string: "Local", "State", "Field-specific", "Demographic", or "General")`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error response:', errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const openAIData = await response.json();
  console.log('OpenAI raw response:', openAIData);
  
  if (!openAIData.choices?.[0]?.message?.content) {
    throw new Error('No content in OpenAI response');
  }

  try {
    const scholarships = JSON.parse(openAIData.choices[0].message.content);
    console.log('Parsed scholarships:', scholarships);
    return scholarships;
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw new Error('Failed to parse OpenAI response');
  }
}

function buildUserProfilePrompt(userProfile: UserProfile): string {
  return `
    Location: ${userProfile.city}, ${userProfile.state}
    Education Level: ${userProfile.current_education_level || 'Any'}
    Major: ${userProfile.intended_major || 'Any'}
    GPA: ${userProfile.gpa || 'Any'}
    Ethnicity: ${userProfile.ethnicity || 'Any'}
    First Generation Student: ${userProfile.first_generation_student ? 'Yes' : 'No'}
    Keywords: ${(userProfile.keywords || []).join(', ')}
    Extracurricular Activities: ${(userProfile.extracurricular_activities || []).join(', ')}
    Organizations: ${(userProfile.organizations || []).join(', ')}
  `;
}
