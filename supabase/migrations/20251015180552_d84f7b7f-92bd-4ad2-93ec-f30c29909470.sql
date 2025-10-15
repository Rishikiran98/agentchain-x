-- CRITICAL SECURITY FIX: Prevent unauthorized message injection
-- Current policy allows ANY authenticated user to insert messages into ANY run
-- This could allow attackers to corrupt conversation history or manipulate AI behavior

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can create messages" ON public.messages;

-- Create strict policy: Only allow message creation for runs owned by the user
CREATE POLICY "Users can create messages for their own runs"
ON public.messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM runs
    JOIN workflows ON workflows.id = runs.workflow_id
    WHERE runs.id = messages.run_id
    AND workflows.user_id = auth.uid()
  )
);

-- Add comment explaining the security requirement
COMMENT ON POLICY "Users can create messages for their own runs" ON public.messages IS 
'Restricts message insertion to runs owned by the authenticated user. Prevents attackers from injecting fake messages into other users'' workflow conversations or manipulating AI behavior.';