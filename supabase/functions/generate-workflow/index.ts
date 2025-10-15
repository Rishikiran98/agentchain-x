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

    const systemPrompt = `You are an expert workflow architect for PromptChain-X. Design optimal multi-agent workflows based on task complexity and type.

CRITICAL RULES:
1. Create 2-6 agents (NOT always 4!) - match count to task complexity
2. Simple tasks (summarize, translate) = 2-3 agents
3. Complex tasks (research, build, design) = 4-6 agents
4. Engineering/code tasks = include Technical/Developer roles
5. Make each system prompt HIGHLY specific to the exact task

AGENT ROLES (choose based on task):
Technical/Engineering:
- Architect: System design, tech stack, architecture decisions
- Developer: Write code, implement features, debug
- Code Reviewer: Review code quality, security, performance
- QA Engineer: Test planning, edge cases, quality assurance
- DevOps: Deployment, scaling, infrastructure
- Technical Writer: API docs, technical documentation

Creative/Content:
- Researcher: Gather info, find sources, analyze data
- Strategist: Plan approach, analyze options
- Writer: Draft content, create copy
- Editor: Refine, improve clarity
- Designer: Create concepts, visual structure

Business/Analysis:
- Analyst: Evaluate data, find patterns
- Reviewer: Critique, quality control
- Consultant: Strategic advice, recommendations

WORKFLOW PATTERNS:
- Sequential (A→B→C): For step-by-step processes
- Parallel+Merge (A→C, B→C): For independent analyses that converge
- Simple Chain (A→B): For straightforward tasks

RESPONSE FORMAT (pure JSON, no markdown):
{
  "nodes": [
    {
      "id": "node-1",
      "role": "Specific Role Name",
      "systemPrompt": "DETAILED task-specific instructions. Reference the user's exact request. Specify expected output format.",
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

Position: x=100, y increases by 150 per node.

EXAMPLES:
"Build a REST API" → 3-4 agents: Architect→Developer→Reviewer
"Debug performance issue" → 2-3 agents: Analyzer→Developer→Tester
"Write blog post" → 2-3 agents: Researcher→Writer→Editor
"Design database schema" → 3-4 agents: Analyst→Architect→Developer→Reviewer
"Summarize article" → 2 agents: Analyzer→Writer`;

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
