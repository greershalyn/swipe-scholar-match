
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
    console.log('Extracting text from file with mime type:', mimeType);
    
    if (mimeType.includes('pdf')) {
      const pdfData = await pdfParse(new Uint8Array(fileData));
      return pdfData.text;
    } else if (mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('docx')) {
      const result = await mammoth.extractRawText({ arrayBuffer: fileData });
      return result.value;
    }
    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error(`Failed to extract text from document: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, mimeType } = await req.json();
    console.log('Processing file:', filePath, 'type:', mimeType);

    if (!filePath || !mimeType) {
      throw new Error('Missing required parameters: filePath or mimeType');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl ?? '', supabaseServiceKey ?? '');

    // Download the file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('essay-documents')
      .download(filePath);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw downloadError;
    }

    if (!fileData) {
      throw new Error('No file data received');
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Extract text from the document
    const text = await extractTextFromFile(arrayBuffer, mimeType);
    console.log('Extracted text from document, length:', text.length);

    if (!text || text.length < 10) {
      throw new Error('Could not extract meaningful text from document');
    }

    // Process with OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to process essay with AI');
    }

    const data = await response.json();
    const results = JSON.parse(data.choices[0].message.content);
    console.log('Generated review results:', results.length, 'issues found');

    // Delete the uploaded file after processing
    await supabase.storage
      .from('essay-documents')
      .remove([filePath]);

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in review-essay-document function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process document', 
        details: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
