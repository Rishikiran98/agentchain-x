-- Security Fix: Restrict template viewing to authenticated users only
-- This prevents unauthorized access to proprietary AI system prompts and workflow configurations

-- Drop the existing policy that allows public template access
DROP POLICY IF EXISTS "Users can view templates and own workflows" ON public.workflows;

-- Create new policy: Only authenticated users can view templates and their own workflows
CREATE POLICY "Authenticated users can view templates and own workflows"
ON public.workflows
FOR SELECT
USING (
  (is_template = true AND auth.uid() IS NOT NULL) 
  OR 
  (auth.uid() = user_id)
);

-- Add missing UPDATE and DELETE policies for runs table to prevent unauthorized modifications
CREATE POLICY "Users can update runs of their workflows"
ON public.runs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM workflows 
    WHERE workflows.id = runs.workflow_id 
    AND workflows.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete runs of their workflows"
ON public.runs
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM workflows 
    WHERE workflows.id = runs.workflow_id 
    AND workflows.user_id = auth.uid()
  )
);

-- Add comment explaining the security decision
COMMENT ON POLICY "Authenticated users can view templates and own workflows" ON public.workflows IS 
'Templates contain proprietary AI system prompts and business logic. Access is restricted to authenticated users to prevent competitors from copying intellectual property.';