
import { UserProfile, ScholarshipResponse } from './types.ts';

export async function fetchScholarshipsFromOpenAI(userProfile: UserProfile, apiKey: string): Promise<ScholarshipResponse> {
  const searchPrompt = `
    Find current available scholarships for a student with the following profile:
    - Major: ${userProfile.intended_major || 'Any'}
    - GPA: ${userProfile.gpa || 'Not specified'}
    - Education Level: ${userProfile.current_education_level || 'Any'}
    - Ethnicity: ${userProfile.ethnicity || 'Not specified'}
    - First Generation Student: ${userProfile.first_generation_student ? 'Yes' : 'No'}
    
    For each scholarship, provide:
    1. Title
    2. Amount (in USD)
    3. Application deadline
    4. Eligibility requirements
    5. Provider/organization name
    6. Application URL
    7. A brief description
    
    Return the data in a structured JSON format. Only include currently active scholarships with deadlines in the future.
  `;

  console.log('Sending prompt to OpenAI:', searchPrompt);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a scholarship research assistant helping to find relevant scholarships for students. Only provide real, currently available scholarships.'
        },
        {
          role: 'user',
          content: searchPrompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI API error response:', errorData);
    
    if (errorData.includes('insufficient_quota') || errorData.includes('billing')) {
      throw new Error('OpenAI API billing setup required');
    }
    
    throw new Error(`OpenAI API error: ${errorData}`);
  }

  const data = await response.json();
  console.log('OpenAI API raw response:', data);
  
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Invalid response format from OpenAI');
  }

  const content = data.choices[0].message.content;
  console.log('Raw content from OpenAI:', content);
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    console.error('Raw content that failed to parse:', content);
    throw new Error('Invalid JSON response from OpenAI');
  }
}
