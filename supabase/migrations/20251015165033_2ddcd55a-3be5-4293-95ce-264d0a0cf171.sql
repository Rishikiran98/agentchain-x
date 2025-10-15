-- Add is_template field to workflows table
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false;

-- Make user_id nullable to support system templates
ALTER TABLE public.workflows ALTER COLUMN user_id DROP NOT NULL;

-- Create index for faster template queries
CREATE INDEX IF NOT EXISTS idx_workflows_is_template ON public.workflows(is_template) WHERE is_template = true;

-- Insert the five template workflows (with null user_id for system templates)
INSERT INTO public.workflows (title, description, nodes, edges, is_template, user_id)
VALUES
  (
    'Startup Idea Generator',
    'Research, strategize, write, and review AI startup ideas for 2025',
    '[
      {"id":"node-1","role":"Researcher","systemPrompt":"Find 3 promising AI startup ideas for 2025. Focus on emerging technologies, market gaps, and scalability potential.","model":"google/gemini-2.5-flash","temperature":0.7,"maxTokens":1000,"x":100,"y":100},
      {"id":"node-2","role":"Strategist","systemPrompt":"Outline a business plan for one of the startup ideas from the research. Include target market, revenue model, and competitive advantages.","model":"google/gemini-2.5-flash","temperature":0.7,"maxTokens":1000,"x":100,"y":250},
      {"id":"node-3","role":"Writer","systemPrompt":"Draft a compelling two-paragraph investor pitch based on the business plan. Make it concise and persuasive.","model":"google/gemini-2.5-flash","temperature":0.8,"maxTokens":800,"x":100,"y":400},
      {"id":"node-4","role":"Reviewer","systemPrompt":"Polish and critique the final pitch. Suggest improvements for clarity, impact, and investor appeal.","model":"google/gemini-2.5-flash","temperature":0.5,"maxTokens":800,"x":100,"y":550}
    ]'::jsonb,
    '[
      {"id":"edge-1","from":"node-1","to":"node-2"},
      {"id":"edge-2","from":"node-2","to":"node-3"},
      {"id":"edge-3","from":"node-3","to":"node-4"}
    ]'::jsonb,
    true,
    NULL
  ),
  (
    'Code Review Pipeline',
    'Architect, develop, test, and review code collaboratively',
    '[
      {"id":"node-1","role":"Architect","systemPrompt":"Describe the purpose and structure of this code. Explain architectural decisions and design patterns.","model":"google/gemini-2.5-flash","temperature":0.6,"maxTokens":1000,"x":100,"y":100},
      {"id":"node-2","role":"Developer","systemPrompt":"Suggest code improvements or fixes. Focus on performance, readability, and best practices.","model":"google/gemini-2.5-flash","temperature":0.7,"maxTokens":1200,"x":100,"y":250},
      {"id":"node-3","role":"Tester","systemPrompt":"Write or review test cases. Ensure comprehensive coverage and edge case handling.","model":"google/gemini-2.5-flash","temperature":0.6,"maxTokens":1000,"x":100,"y":400},
      {"id":"node-4","role":"Reviewer","systemPrompt":"Summarize issues and give constructive feedback. Prioritize critical changes and approve when ready.","model":"google/gemini-2.5-flash","temperature":0.5,"maxTokens":800,"x":100,"y":550}
    ]'::jsonb,
    '[
      {"id":"edge-1","from":"node-1","to":"node-2"},
      {"id":"edge-2","from":"node-2","to":"node-3"},
      {"id":"edge-3","from":"node-3","to":"node-4"}
    ]'::jsonb,
    true,
    NULL
  ),
  (
    'Policy Review Board',
    'Multi-perspective policy analysis from legal, ethics, and finance teams',
    '[
      {"id":"node-1","role":"Legal Advisor","systemPrompt":"Review compliance implications. Identify regulatory risks and legal requirements.","model":"google/gemini-2.5-flash","temperature":0.5,"maxTokens":1000,"x":100,"y":100},
      {"id":"node-2","role":"Ethics Officer","systemPrompt":"Identify ethical risks and considerations. Evaluate fairness, transparency, and social impact.","model":"google/gemini-2.5-flash","temperature":0.6,"maxTokens":1000,"x":100,"y":250},
      {"id":"node-3","role":"Finance Lead","systemPrompt":"Assess financial impact. Calculate costs, benefits, and ROI projections.","model":"google/gemini-2.5-flash","temperature":0.5,"maxTokens":1000,"x":100,"y":400},
      {"id":"node-4","role":"Chairperson","systemPrompt":"Summarize board decision. Synthesize all perspectives and provide a final recommendation.","model":"google/gemini-2.5-flash","temperature":0.6,"maxTokens":800,"x":100,"y":550}
    ]'::jsonb,
    '[
      {"id":"edge-1","from":"node-1","to":"node-2"},
      {"id":"edge-2","from":"node-2","to":"node-3"},
      {"id":"edge-3","from":"node-3","to":"node-4"}
    ]'::jsonb,
    true,
    NULL
  ),
  (
    'Story Collaboration',
    'Collaborative storytelling with world-building, character design, and critique',
    '[
      {"id":"node-1","role":"WorldBuilder","systemPrompt":"Outline a sci-fi world setting. Include technology level, social structure, and key conflicts.","model":"google/gemini-2.5-flash","temperature":0.9,"maxTokens":1200,"x":100,"y":100},
      {"id":"node-2","role":"CharacterDesigner","systemPrompt":"Create a compelling protagonist for this world. Define their background, motivations, and unique traits.","model":"google/gemini-2.5-flash","temperature":0.9,"maxTokens":1000,"x":100,"y":250},
      {"id":"node-3","role":"Editor","systemPrompt":"Ensure narrative consistency. Check for plot holes, pacing issues, and character development.","model":"google/gemini-2.5-flash","temperature":0.6,"maxTokens":1000,"x":100,"y":400},
      {"id":"node-4","role":"Critic","systemPrompt":"Offer constructive story feedback. Evaluate originality, engagement, and emotional impact.","model":"google/gemini-2.5-flash","temperature":0.7,"maxTokens":800,"x":100,"y":550}
    ]'::jsonb,
    '[
      {"id":"edge-1","from":"node-1","to":"node-2"},
      {"id":"edge-2","from":"node-2","to":"node-3"},
      {"id":"edge-3","from":"node-3","to":"node-4"}
    ]'::jsonb,
    true,
    NULL
  ),
  (
    'RAG Evaluation Chain',
    'Retrieve, generate, and evaluate answers using RAG methodology',
    '[
      {"id":"node-1","role":"Retriever","systemPrompt":"Fetch relevant context passages from the knowledge base. Return the most pertinent information for answering the question.","model":"google/gemini-2.5-flash","temperature":0.3,"maxTokens":1000,"x":100,"y":100},
      {"id":"node-2","role":"Generator","systemPrompt":"Answer the user question using retrieved data. Ground your response in the provided context and cite sources.","model":"google/gemini-2.5-flash","temperature":0.6,"maxTokens":1200,"x":100,"y":250},
      {"id":"node-3","role":"Evaluator","systemPrompt":"Score grounding, faithfulness, and completeness. Rate how well the answer uses retrieved context and addresses the question (scale 1-10).","model":"google/gemini-2.5-flash","temperature":0.4,"maxTokens":800,"x":100,"y":400}
    ]'::jsonb,
    '[
      {"id":"edge-1","from":"node-1","to":"node-2"},
      {"id":"edge-2","from":"node-2","to":"node-3"}
    ]'::jsonb,
    true,
    NULL
  )
ON CONFLICT DO NOTHING;

-- Drop old RLS policy if it exists
DROP POLICY IF EXISTS "Users can view their own workflows" ON public.workflows;

-- Create updated RLS policy to allow templates and user workflows
CREATE POLICY "Users can view templates and their own workflows"
ON public.workflows
FOR SELECT
USING (is_template = true OR auth.uid() = user_id);