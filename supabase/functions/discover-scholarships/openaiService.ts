
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
            with ONLY verified, working application links from trusted sources.

            Guidelines for scholarship selection:
            - Prioritize matches based on the student's specific field of study, demographics, and qualifications
            - Include a mix of both local/state scholarships and national opportunities
            - ONLY include scholarships with direct application links that you are certain are valid and working
            - Each URL must lead directly to the scholarship application page, not general information pages
            - Every URL must be secure (https://) and from recognized scholarship providers
            - Exclude any scholarship without a verifiable direct application link
            - Do not generate placeholder or example URLs - only include real, working links
            
            Required URL verification criteria:
            1. URL must be HTTPS and not contain suspicious patterns (example.com, placeholder, test)
            2. URL must lead directly to the scholarship application page, not a general homepage 
            3. URL must be from one of these trusted sources:
               - Educational institutions (.edu domains)
               - Government websites (.gov domains)
               - Official scholarship organizations (.org domains focused on scholarships)
               - Established scholarship platforms such as:
                 - fastweb.com, scholarships.com, unigo.com, cappex.com
                 - chegg.com, collegeboard.org, petersons.com, niche.com
                 - salliemae.com, studentaid.gov, scholarship-positions.com
                 - scholarshipamerica.org, thurgoodmarshallfund.net, uncf.org
                 - hispanicfund.org, apiasf.org, hsf.net
            
            Important: For each scholarship, you MUST verify that:
            1. The URL directly links to the specific scholarship mentioned
            2. The page explicitly includes the scholarship name and application details
            3. The application deadline is current (not in the past)
            4. The link is not to a third-party search engine or aggregator that requires additional navigation`
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

            IMPORTANT URL REQUIREMENTS:
            - Each source_url MUST be a direct, working link to the application page
            - Only include HTTPS URLs from trusted scholarship domains
            - Do not provide placeholder URLs or generic search links
            - Verify each URL leads directly to the specific scholarship application
            - If you cannot find a direct application link for a scholarship, do not include it

            Prioritize scholarships that most closely match the student's:
            1. Field of study/intended major
            2. Geographic location (if specified)
            3. Demographics and background
            4. Academic achievements
            5. Extracurricular activities and interests`
        }
      ],
      temperature: 0.5,
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
