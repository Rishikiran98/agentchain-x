import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Generating workflow from prompt:', prompt);

    const systemPrompt = `You are a workflow generator for PromptChain-X. Convert user requests into multi-agent workflows.

Analyze the user's goal and create 2-4 specialized AI agents that collaborate to achieve it.

Available agent roles:
- Researcher: Gathers information, finds facts
- Strategist: Plans approaches, analyzes options
- Writer: Creates content, drafts text
- Reviewer: Critiques, improves quality
- Developer: Writes or reviews code
- Analyst: Evaluates data, finds patterns
- Designer: Creates concepts, plans structure
- Editor: Refines, ensures consistency

Return ONLY valid JSON (no markdown, no explanation):
{
  "nodes": [
    {
      "id": "node-1",
      "role": "Agent Role",
      "systemPrompt": "Specific instruction for this agent",
      "model": "google/gemini-2.5-flash",
      "temperature": 0.7,
      "maxTokens": 1000,
      "x": 100,
      "y": 100
    }
  ],
  "edges": [
    {"id": "edge-1", "from": "node-1", "to": "node-2"}
  ]
}

Position nodes vertically (x=100, y increases by 150).
Make system prompts specific and actionable.
Connect nodes sequentially for workflow flow.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw AI response:', content);

    // Extract JSON from markdown code blocks if present
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      const lines = jsonStr.split('\n');
      jsonStr = lines.slice(1, -1).join('\n');
      if (jsonStr.startsWith('json')) {
        jsonStr = jsonStr.slice(4);
      }
    }

    const workflow = JSON.parse(jsonStr);
    
    console.log('Parsed workflow:', workflow);

    return new Response(
      JSON.stringify(workflow),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-workflow:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to generate workflow from prompt'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
