
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
          content: `You are an expert scholarship matching system that finds highly relevant, active scholarships 
            for students based on their detailed profiles. Focus on providing diverse yet targeted opportunities 
            from verified sources.

            Guidelines for scholarship selection:
            - Prioritize matches based on the student's specific field of study, demographics, and qualifications
            - Include a mix of both local/state scholarships and national opportunities
            - Ensure scholarships are from reputable organizations (.edu domains, recognized foundations, accredited institutions)
            - Verify that sources are well-known scholarship platforms or official institutional websites
            - Focus on current opportunities with active application periods
            - Exclude expired scholarships or those with broken/inactive links
            
            Acceptable source domains include:
            1. Educational institutions (.edu)
            2. Government websites (.gov)
            3. Major scholarship platforms:
               - fastweb.com
               - scholarships.com
               - unigo.com
               - cappex.com
               - chegg.com
               - collegeboard.org
            4. Professional/Industry organizations in the student's field
            5. Recognized non-profit foundations
            
            For each scholarship, provide comprehensive details including specific eligibility criteria 
            and direct application links. Ensure all information is current and verifiable.`
        },
        {
          role: 'user',
          content: `Find the most relevant scholarships for this student profile:
            ${userProfilePrompt}

            Return exactly 10 scholarships as a JSON object with a "scholarships" array. 
            Each scholarship must include:
            {
              "title": "string (descriptive title)",
              "amount": number (scholarship value, numbers only),
              "requirements": string[] (specific eligibility criteria),
              "provider": "string (organization name)",
              "description": "string (detailed description including key details)",
              "category": "Local" | "State" | "Field-specific" | "Demographic" | "General",
              "source_url": "string (direct URL to official application page)"
            }

            Prioritize scholarships that most closely match the student's:
            1. Field of study/intended major
            2. Geographic location (if specified)
            3. Demographics and background
            4. Academic achievements
            5. Extracurricular activities and interests
            
            Ensure each URL is functional and leads directly to the scholarship information.`
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
  const details = [
    `Location: ${userProfile.city || 'Any'}, ${userProfile.state || 'Any'}`,
    `Education Level: ${userProfile.current_education_level || 'Any'}`,
    `Major/Field of Study: ${userProfile.intended_major || 'Any'}`,
    `GPA: ${userProfile.gpa || 'Not specified'}`,
    `Ethnicity: ${userProfile.ethnicity || 'Not specified'}`,
    `First Generation Student: ${userProfile.first_generation_student ? 'Yes' : 'No'}`,
    `Keywords/Interests: ${(userProfile.keywords || []).join(', ') || 'None'}`,
    `Extracurricular Activities: ${(userProfile.extracurricular_activities || []).join(', ') || 'None'}`,
    `Organizations: ${(userProfile.organizations || []).join(', ') || 'None'}`,
    userProfile.disability_status ? 'Has disability status' : null,
    userProfile.military_affiliation ? `Military affiliation: ${userProfile.military_affiliation}` : null,
    userProfile.financial_need ? 'Has financial need' : null,
    userProfile.sat_score ? `SAT Score: ${userProfile.sat_score}` : null,
    userProfile.act_score ? `ACT Score: ${userProfile.act_score}` : null,
    userProfile.household_income ? `Household Income: ${userProfile.household_income}` : null,
  ].filter(Boolean).join('\n');

  return details;
}
