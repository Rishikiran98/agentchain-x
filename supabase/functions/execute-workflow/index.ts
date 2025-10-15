import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workflowId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (workflowError) throw workflowError;

    // Create a new run
    const { data: run, error: runError } = await supabase
      .from('runs')
      .insert({
        workflow_id: workflowId,
        status: 'running',
        shared_memory: { context: '', facts: [], recent_messages: [] }
      })
      .select()
      .single();

    if (runError) throw runError;

    // Execute nodes sequentially
    const nodes = workflow.nodes || [];
    let sharedMemory = run.shared_memory;

    for (const node of nodes) {
      console.log(`Executing node: ${node.id}`);

      // Build prompt with shared memory
      const prompt = `${node.systemPrompt}\n\nShared Context:\n${JSON.stringify(sharedMemory, null, 2)}\n\nYour role is: ${node.role}`;

      // Call Lovable AI
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: node.model || 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: node.systemPrompt },
            { role: 'user', content: `Context: ${JSON.stringify(sharedMemory)}` }
          ],
          temperature: node.temperature || 0.7,
          max_tokens: node.maxTokens || 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API error: ${errorText}`);
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices[0].message.content;

      // Save message
      await supabase.from('messages').insert({
        run_id: run.id,
        node_id: node.id,
        role: node.role,
        content: content,
      });

      // Update shared memory
      sharedMemory.recent_messages.push({
        role: node.role,
        content: content,
        timestamp: new Date().toISOString()
      });
    }

    // Update run status
    await supabase
      .from('runs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        shared_memory: sharedMemory
      })
      .eq('id', run.id);

    return new Response(JSON.stringify({ 
      success: true, 
      runId: run.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error executing workflow:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});