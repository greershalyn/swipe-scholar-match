
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import * as pdfParse from 'npm:pdf-parse';
import * as mammoth from 'npm:mammoth';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function extractTextFromFile(fileData: ArrayBuffer, mimeType: string): Promise<string> {
  try {
    console.log('Starting text extraction for mime type:', mimeType);
    
    if (mimeType.includes('pdf')) {
      console.log('Processing PDF document...');
      const dataArray = new Uint8Array(fileData);
      const pdfData = await pdfParse(dataArray);
      console.log('PDF text extracted, length:', pdfData.text.length);
      return pdfData.text;
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      console.log('Processing Word document...');
      const result = await mammoth.extractRawText({ arrayBuffer: fileData });
      console.log('Word document text extracted, length:', result.value.length);
      return result.value;
    }
    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Text extraction failed: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, mimeType } = await req.json();
    console.log('Starting document review process for:', filePath);

    if (!filePath || !mimeType) {
      throw new Error('Missing required parameters: filePath or mimeType');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    console.log('Initializing Supabase client...');
    const supabase = createClient(supabaseUrl ?? '', supabaseServiceKey ?? '');

    console.log('Downloading file from storage...');
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('essay-documents')
      .download(filePath);

    if (downloadError) {
      console.error('File download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    if (!fileData) {
      throw new Error('No file data received from storage');
    }

    console.log('Converting file to ArrayBuffer...');
    const arrayBuffer = await fileData.arrayBuffer();
    
    console.log('Extracting text from document...');
    const text = await extractTextFromFile(arrayBuffer, mimeType);

    if (!text || text.length < 10) {
      throw new Error('Extracted text is too short or empty');
    }

    console.log('Sending text to OpenAI for analysis...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional essay reviewer. Analyze the essay for grammar, punctuation, 
            sentence structure, and clarity issues. DO NOT rewrite any content. Instead:
            1. Identify specific issues
            2. Explain why each issue needs attention
            3. Format your response as a JSON array of objects with these properties:
               - sentence: the problematic sentence
               - error: brief description of the issue
               - explanation: detailed explanation of why it's an issue
               - startIndex: where the issue begins in the sentence
               - endIndex: where the issue ends in the sentence`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to process essay with AI');
    }

    const data = await response.json();
    let results;
    try {
      results = JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      results = data.choices[0].message.content;
      if (typeof results !== 'object' || !Array.isArray(results)) {
        results = [{
          sentence: "Unable to parse AI response",
          error: "AI Response Format Error",
          explanation: "The AI provided feedback but not in the expected format. Please try again.",
          startIndex: 0,
          endIndex: 0
        }];
      }
    }

    console.log('Successfully generated review results:', results.length, 'issues found');

    // Clean up: Delete the uploaded file
    console.log('Cleaning up: removing uploaded file...');
    await supabase.storage
      .from('essay-documents')
      .remove([filePath]);

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Document review error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Document review failed', 
        details: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
