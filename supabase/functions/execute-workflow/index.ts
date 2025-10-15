import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Topological sort for graph execution
function topologicalSort(nodes: any[], edges: any[]): any[] {
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  
  // Initialize
  nodes.forEach(node => {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  });
  
  // Build graph
  edges.forEach(edge => {
    graph.get(edge.from)?.push(edge.to);
    inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
  });
  
  // Find nodes with no incoming edges
  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });
  
  const sorted: string[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    sorted.push(nodeId);
    
    graph.get(nodeId)?.forEach(neighbor => {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    });
  }
  
  // Return nodes in execution order
  return sorted.map(id => nodes.find(n => n.id === id)).filter(Boolean);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workflowId } = await req.json();
    
    // Input validation
    if (!workflowId || typeof workflowId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Workflow ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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
        shared_memory: { context: '', facts: [], history: [] }
      })
      .select()
      .single();

    if (runError) throw runError;

    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];
    let sharedMemory = run.shared_memory;

    // Sort nodes by graph dependencies
    const executionOrder = edges.length > 0 
      ? topologicalSort(nodes, edges)
      : nodes;

    console.log('Execution order:', executionOrder.map((n: any) => n.role));

    // Execute nodes in order
    for (const node of executionOrder) {
      console.log(`Executing node: ${node.id} (${node.role})`);

      // Build context from shared memory
      const contextStr = sharedMemory.history.length > 0
        ? sharedMemory.history.map((h: any) => `[${h.role}]: ${h.content}`).join('\n\n')
        : 'No previous context.';

      const prompt = `${node.systemPrompt}\n\nConversation History:\n${contextStr}`;

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
            { role: 'user', content: `Previous context:\n${contextStr}\n\nYour task as ${node.role}:` }
          ],
          temperature: node.temperature || 0.7,
          max_tokens: node.maxTokens || 3000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI API error for node ${node.id}:`, response.status, errorText);
        
        // Handle specific error codes
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait and try again.');
        }
        
        if (response.status === 402) {
          throw new Error('AI credits depleted. Please add credits to continue.');
        }
        
        throw new Error(`AI API error: ${response.status} - ${errorText}`);
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices[0].message.content;

      // Save message with model info
      await supabase.from('messages').insert({
        run_id: run.id,
        node_id: node.id,
        role: node.role,
        content: content,
      });

      // Update shared memory
      sharedMemory.history.push({
        role: node.role,
        content: content,
        model: node.model,
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